package com.huyen.bookeeshop.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * VNPay gửi params dưới dạng query string (GET request):
 * ?vnp_TmnCode=...&vnp_ResponseCode=00&vnp_SecureHash=...
 *
 * Dùng @ModelAttribute để bind → tên field phải KHỚP CHÍNH XÁC với tên query param.
 * @JsonProperty chỉ dành cho JSON body — không hoạt động với query string.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VNPayReturnRequest {

    // Tên field = tên query param VNPay gửi về (camelCase map sang snake_case qua Spring binding)
    // Spring @ModelAttribute tự map: vnp_TmnCode → vnpTmnCode KHÔNG hoạt động
    // Phải dùng tên field khớp chính xác với query param name

    String vnp_TmnCode;
    String vnp_BankCode;
    String vnp_BankTranNo;
    String vnp_CardType;
    String vnp_OrderInfo;
    String vnp_Amount;
    String vnp_CurrCode;
    String vnp_TxnRef;
    String vnp_TransactionNo;
    String vnp_TransactionStatus;
    String vnp_ResponseCode;
    String vnp_PayDate;
    String vnp_SecureHash;
    String vnp_SecureHashType;

    // ── Convenience getters dùng trong service (giữ tên cũ để không phá service) ──

    public String getVnpTmnCode()           { return vnp_TmnCode; }
    public String getVnpBankCode()          { return vnp_BankCode; }
    public String getVnpBankTranNo()        { return vnp_BankTranNo; }
    public String getVnpCardType()          { return vnp_CardType; }
    public String getVnpOrderInfo()         { return vnp_OrderInfo; }
    public String getVnpAmount()            { return vnp_Amount; }
    public String getVnpCurrCode()          { return vnp_CurrCode; }
    public String getVnpTxnRef()            { return vnp_TxnRef; }
    public String getVnpTransactionNo()     { return vnp_TransactionNo; }
    public String getVnpTransactionStatus() { return vnp_TransactionStatus; }
    public String getVnpResponseCode()      { return vnp_ResponseCode; }
    public String getVnpPayDate()           { return vnp_PayDate; }
    public String getVnpSecureHash()        { return vnp_SecureHash; }
}