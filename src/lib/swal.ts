import Swal from "sweetalert2";

// Custom styled SweetAlert2
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const showSuccess = (message: string) => {
  return Toast.fire({
    icon: "success",
    title: message,
  });
};

export const showError = (message: string) => {
  return Toast.fire({
    icon: "error",
    title: message,
  });
};

export const showWarning = (message: string) => {
  return Toast.fire({
    icon: "warning",
    title: message,
  });
};

export const showInfo = (message: string) => {
  return Toast.fire({
    icon: "info",
    title: message,
  });
};

export const confirmDelete = async (itemName: string = "รายการนี้") => {
  const result = await Swal.fire({
    title: "ยืนยันการลบ?",
    html: `คุณต้องการลบ <strong>${itemName}</strong> หรือไม่?<br/>การกระทำนี้ไม่สามารถย้อนกลับได้`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "ลบ",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const confirmAction = async (
  title: string,
  text: string,
  confirmText: string = "ยืนยัน"
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const showLoading = (title: string = "กำลังดำเนินการ...") => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const hideLoading = () => {
  Swal.close();
};

export const showSuccessDialog = async (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonColor: "#3b82f6",
    confirmButtonText: "ตกลง",
  });
};

export const showErrorDialog = async (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonColor: "#ef4444",
    confirmButtonText: "ตกลง",
  });
};

export default Swal;
