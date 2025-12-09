import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Copy,
  Loader2,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { IPaymentDetails, IPaymentStep } from "../types";
import { CURRENT_USER } from "../constants";
import RetionLogo from "../assets/icons/Logo_retion_embed.png";
import { API_CONFIG } from "../services/api.config";

export interface IPaymentOverlayProps {
  /** Bước thanh toán hiện tại */
  step: IPaymentStep;
  /** Chi tiết thanh toán */
  details: IPaymentDetails | null;
  /** Hàm đóng modal */
  onClose: () => void;
  /** Hàm reset */
  onReset: () => void;
  /** Hàm trigger mô phỏng thành công */
  simulateSuccessTrigger: () => void;
  /** Tên người dùng hiện tại */
  currentUser?: string;
}

/**
 * Component hiển thị overlay thanh toán
 * @param {IPaymentOverlayProps} props - Props đầu vào
 * @returns {JSX.Element | null} - Giao diện PaymentOverlay hoặc null
 */
const PaymentOverlay: React.FC<IPaymentOverlayProps> = ({
  step,
  details,
  onClose,
  onReset,
  simulateSuccessTrigger,
  currentUser,
}) => {
  const { t } = useTranslation();

  /** Trạng thái feedback copy */
  const [COPY_FEEDBACK, SetCopyFeedback] = useState(false);

  /**
   * Auto-simulate success after 5 seconds if in pending state
   */
  useEffect(() => {
    /** Timer để tự động chuyển sang success */
    let TIMER: ReturnType<typeof setTimeout>;
    if (step === "pending") {
      TIMER = setTimeout(() => {
        simulateSuccessTrigger();
      }, 50000000); // Disable auto simulate effectively
    }
    return () => clearTimeout(TIMER);
  }, [step, simulateSuccessTrigger]);

  if (step === "idle" || !details) return null;

  /**
   * Định dạng tiền tệ
   * @param {number} val - Giá trị số
   * @returns {string} - Chuỗi định dạng tiền
   */
  const FormatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  /**
   * Xử lý copy link
   */
  /**
   * Xử lý download QR
   */
  const HandleDownloadQr = async () => {
    try {
      const QR_BASE_URL =
        API_CONFIG.QR_SERVICE_URL ||
        "https://api.qrserver.com/v1/create-qr-code/";
      const QR_SRC = `${QR_BASE_URL}?size=500x500&data=${encodeURIComponent(
        details.qrCode || details.content
      )}`;

      const response = await fetch(QR_SRC);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-Payment-${details.content}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download QR", e);
      alert("Không thể tải ảnh QR. Vui lòng thử lại.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with blur */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
          aria-hidden="true"
          onClick={step === "pending" ? onClose : undefined}
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          {/* --- CONTENT FOR PENDING STATE --- */}
          {step === "pending" && (
            <div className="bg-white p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* LEFT: QR Display */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-64 h-64 p-2 bg-white rounded-lg shadow-sm">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg -mb-1 -mr-1"></div>

                    {/* QR Image */}
                    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-gray-50 relative">
                      <img
                        src={`${
                          API_CONFIG.QR_SERVICE_URL ||
                          "https://api.qrserver.com/v1/create-qr-code/"
                        }?size=300x300&data=${encodeURIComponent(
                          details.qrCode || details.content
                        )}`}
                        alt="Payment QR"
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                      {/* Centered Logo */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-lg p-1 shadow-sm flex items-center justify-center">
                        <img
                          src={RetionLogo}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Loading Overlay */}
                    {!details.qrCode && !details.content && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-2xl font-bold text-blue-600">
                    {FormatCurrency(details.amount)}
                  </p>
                </div>

                {/* RIGHT: Instructions & Actions */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                        <RotateCcw className="w-4 h-4" />
                      </span>
                      {t("payment_modal_title", { defaultValue: "Thanh toán" })}
                    </h3>

                    <div className="space-y-4 text-sm text-gray-600 mb-6">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">
                          1
                        </span>
                        <p>
                          {t("step_open_app", {
                            defaultValue:
                              "Mở ứng dụng Ngân hàng hoặc Ví điện tử trên điện thoại.",
                          })}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">
                          2
                        </span>
                        <p>
                          {t("step_choose_qr", {
                            defaultValue: "Chọn tính năng Quét QR (Scan QR).",
                          })}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">
                          3
                        </span>
                        <p>
                          {t("step_scan_code", {
                            defaultValue:
                              "Quét mã QR ở bên cạnh để thanh toán.",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Auto-check hint */}
                    <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 mb-6">
                      <div className="animate-spin text-blue-500">
                        <Loader2 className="w-5 h-5" />
                      </div>
                      <span className="text-sm text-blue-700 font-medium">
                        {t("waiting_payment_auto", {
                          defaultValue: "Hệ thống đang chờ nhận tiền...",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={HandleDownloadQr}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {t("save_image", { defaultValue: "Lưu ảnh QR" })}
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {t("cancel_transaction", {
                        defaultValue: "Hủy giao dịch",
                      })}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- CONTENT FOR SUCCESS STATE --- */}
          {step === "success" && (
            <div className="bg-white">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                    <CheckCircle
                      className="h-12 w-12 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-2">
                    {t("txn_success")}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {t("txn_success_msg")}
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3 mb-6">
                    <div className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 text-green-500 flex items-center justify-center border border-green-500 rounded-full text-xs font-bold mr-3">
                        1
                      </span>
                      <span className="text-sm text-gray-700">
                        {t("received")}{" "}
                        <span className="font-bold">
                          {FormatCurrency(details.amount)}
                        </span>
                      </span>
                    </div>
                    {details.packageName && (
                      <div className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-green-500 flex items-center justify-center border border-green-500 rounded-full text-xs font-bold mr-3">
                          2
                        </span>
                        <span className="text-sm text-gray-700">
                          {t("activated_package")}{" "}
                          <span className="font-bold">
                            {details.packageName}
                          </span>{" "}
                          ({t("year")})
                        </span>
                      </div>
                    )}
                    <div className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 text-green-500 flex items-center justify-center border border-green-500 rounded-full text-xs font-bold mr-3">
                        {details.packageName ? 3 : 2}
                      </span>
                      <span className="text-sm text-gray-700">
                        {t("update_ref_msg", {
                          user: currentUser || CURRENT_USER,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-50">
                <button
                  type="button"
                  onClick={onReset}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm items-center"
                >
                  {t("new_order")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <RotateCcw className="mr-2 w-4 h-4" /> {t("close")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentOverlay;
