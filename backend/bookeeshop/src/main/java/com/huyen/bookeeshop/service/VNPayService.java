package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.VNPayReturnRequest;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VNPayService {

    @Value("${vnpay.tmn-code}")
    String tmnCode;

    @Value("${vnpay.hash-secret}")
    String hashSecret;

    @Value("${vnpay.payment-url}")
    String paymentUrl;

    @Value("${vnpay.return-url}")
    String returnUrl;

    public String createPaymentUrl(String orderId, long amountInVnd, HttpServletRequest request) {
        String ipAddr = request.getRemoteAddr();

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amountInVnd));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", orderId);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", ipAddr);
        vnpParams.put("vnp_CreateDate",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

        String queryString = buildQueryString(vnpParams);
        String secureHash = hmacSHA512(hashSecret, queryString);

        return paymentUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifySignature(VNPayReturnRequest returnRequest) {
        String receivedHash = returnRequest.getVnpSecureHash();

        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }

        // Gom tất cả params trừ vnp_SecureHash vào TreeMap để tự sort
        Map<String, String> vnpParams = new TreeMap<>();
        putIfNotNull(vnpParams, "vnp_TmnCode", returnRequest.getVnpTmnCode());
        putIfNotNull(vnpParams, "vnp_BankCode", returnRequest.getVnpBankCode());
        putIfNotNull(vnpParams, "vnp_BankTranNo", returnRequest.getVnpBankTranNo());
        putIfNotNull(vnpParams, "vnp_CardType", returnRequest.getVnpCardType());
        putIfNotNull(vnpParams, "vnp_OrderInfo", returnRequest.getVnpOrderInfo());
        putIfNotNull(vnpParams, "vnp_Amount", returnRequest.getVnpAmount());
        putIfNotNull(vnpParams, "vnp_CurrCode", returnRequest.getVnpCurrCode());
        putIfNotNull(vnpParams, "vnp_TxnRef", returnRequest.getVnpTxnRef());
        putIfNotNull(vnpParams, "vnp_TransactionNo", returnRequest.getVnpTransactionNo());
        putIfNotNull(vnpParams, "vnp_TransactionStatus", returnRequest.getVnpTransactionStatus());
        putIfNotNull(vnpParams, "vnp_ResponseCode", returnRequest.getVnpResponseCode());
        putIfNotNull(vnpParams, "vnp_PayDate", returnRequest.getVnpPayDate());

        String queryString = buildQueryString(vnpParams);
        String computedHash = hmacSHA512(hashSecret, queryString);

        // So sánh không phân biệt hoa thường
        return computedHash.equalsIgnoreCase(receivedHash);
    }

    private String buildQueryString(Map<String, String> params) {
        return params.entrySet().stream()
                .map(e -> e.getKey() + "="
                        + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }

    private void putIfNotNull(Map<String, String> map, String key, String value) {
        if (value != null && !value.isBlank()) {
            map.put(key, value);
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HmacSHA512 error", e);
        }
    }
}