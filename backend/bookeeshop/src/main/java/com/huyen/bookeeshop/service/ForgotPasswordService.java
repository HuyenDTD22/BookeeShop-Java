package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.constant.PredefinedRole;
import com.huyen.bookeeshop.dto.request.ForgotPasswordRequest;
import com.huyen.bookeeshop.dto.request.ResetPasswordRequest;
import com.huyen.bookeeshop.dto.request.VerifyOtpRequest;
import com.huyen.bookeeshop.entity.ForgotPassword;
import com.huyen.bookeeshop.entity.User;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.repository.ForgotPasswordRepository;
import com.huyen.bookeeshop.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final UserRepository userRepository;
    private final ForgotPasswordRepository forgotPasswordRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    private static int OTP_LENGTH      = 6;
    private static int OTP_EXPIRE_MINS = 5;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * 1. CLIENT - Send OTP, only for customers (role USER)
     */
    @Transactional
    public void sendOtp(ForgotPasswordRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        User user = userRepository.findByUsernameAndDeletedFalseAndLockedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Chỉ cho phép khách hàng (role USER) dùng tính năng này
        boolean isCustomer = user.getRoles().stream()
                .anyMatch(r -> PredefinedRole.USER_ROLE.getName().equals(r.getName()));

        if (!isCustomer) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        // Xóa OTP cũ
        forgotPasswordRepository.deleteAllByEmail(username);

        // Tạo OTP mới 6 chữ số
        String otp = generateOtp();

        ForgotPassword forgotPassword = ForgotPassword.builder()
                .email(username)
                .otp(otp)
                .expireAt(LocalDateTime.now().plusMinutes(OTP_EXPIRE_MINS))
                .build();

        forgotPasswordRepository.save(forgotPassword);

        // Gửi email
        sendOtpEmail(username, otp, user.getFullName());
    }

    /**
     * 2. CLIENT - Verify OTP (just check, not reset)
     */
    @Transactional(readOnly = true)
    public void verifyOtp(VerifyOtpRequest request) {
        String username = request.getUsername().trim().toLowerCase();
        validateOtp(username, request.getOtp());
    }

    /**
     * 3. CLIENT - Reset password (verify OTP + change password)
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        // Validate OTP
        ForgotPassword fp = validateOtp(username, request.getOtp());

        // Tìm user
        User user = userRepository.findByUsernameAndDeletedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Đổi mật khẩu
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Xóa OTP đã dùng
        forgotPasswordRepository.deleteAllByEmail(username);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private ForgotPassword validateOtp(String email, String otp) {
        ForgotPassword fp = forgotPasswordRepository
                .findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (fp.getExpireAt().isBefore(LocalDateTime.now())) {
            // OTP hết hạn
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (!fp.getOtp().equals(otp)) {
            // OTP sai
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return fp;
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private void sendOtpEmail(String toEmail, String otp, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("BookeeShop — Mã xác thực đặt lại mật khẩu");

            String name = (fullName != null && !fullName.isBlank()) ? fullName : toEmail;
            String html = buildOtpEmailHtml(name, otp, OTP_EXPIRE_MINS);
            helper.setText(html, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private String buildOtpEmailHtml(String name, String otp, int expireMinutes) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f0f4fa;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f4fa;padding:32px 0;">
                <tr><td align="center">
                  <table width="480" cellpadding="0" cellspacing="0"
                    style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,28,53,0.10);">
                    <!-- Header -->
                    <tr>
                      <td style="background:#1a6dc4;padding:24px 32px;text-align:center;">
                        <h1 style="margin:0;color:#fff;font-size:1.4rem;font-weight:700;letter-spacing:-0.01em;">
                          📚 BookeeShop
                        </h1>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:32px;">
                        <p style="margin:0 0 12px;font-size:1rem;color:#0f1c35;font-weight:600;">
                          Xin chào %s,
                        </p>
                        <p style="margin:0 0 24px;font-size:0.9rem;color:#4a5d7e;line-height:1.6;">
                          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                          Sử dụng mã OTP bên dưới để tiếp tục:
                        </p>
                        <!-- OTP Box -->
                        <div style="background:#f0f4fa;border:2px dashed #1a6dc4;border-radius:12px;
                                    padding:20px;text-align:center;margin:0 0 24px;">
                          <p style="margin:0 0 6px;font-size:0.78rem;text-transform:uppercase;
                                    letter-spacing:0.08em;color:#8a9ab8;font-weight:600;">
                            Mã xác thực OTP
                          </p>
                          <p style="margin:0;font-size:2.4rem;font-weight:800;
                                    letter-spacing:0.2em;color:#1a6dc4;font-family:monospace;">
                            %s
                          </p>
                        </div>
                        <p style="margin:0 0 24px;font-size:0.85rem;color:#8a9ab8;text-align:center;">
                          ⏱ Mã có hiệu lực trong <strong>%d phút</strong>. Không chia sẻ mã này với bất kỳ ai.
                        </p>
                        <p style="margin:0;font-size:0.82rem;color:#8a9ab8;line-height:1.6;">
                          Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                          Tài khoản của bạn vẫn an toàn.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background:#f7f9fc;padding:16px 32px;text-align:center;
                                 border-top:1px solid #dde3ee;">
                        <p style="margin:0;font-size:0.75rem;color:#8a9ab8;">
                          © 2025 BookeeShop. Tất cả quyền được bảo lưu.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(name, otp, expireMinutes);
    }
}