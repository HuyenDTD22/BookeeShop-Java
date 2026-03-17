package com.huyen.bookeeshop.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VNPayReturnRequest {

    @JsonProperty("vnp_TmnCode")
    String vnpTmnCode;

    @JsonProperty("vnp_BankCode")
    String vnpBankCode;

    @JsonProperty("vnp_BankTranNo")
    String vnpBankTranNo;

    @JsonProperty("vnp_CardType")
    String vnpCardType;

    @JsonProperty("vnp_OrderInfo")
    String vnpOrderInfo;

    @JsonProperty("vnp_Amount")
    String vnpAmount;

    @JsonProperty("vnp_CurrCode")
    String vnpCurrCode;

    @JsonProperty("vnp_TxnRef")
    String vnpTxnRef;

    @JsonProperty("vnp_TransactionNo")
    String vnpTransactionNo;

    @JsonProperty("vnp_TransactionStatus")
    String vnpTransactionStatus;

    @JsonProperty("vnp_ResponseCode")
    String vnpResponseCode;

    @JsonProperty("vnp_PayDate")
    String vnpPayDate;

    @JsonProperty("vnp_SecureHash")
    String vnpSecureHash;
}