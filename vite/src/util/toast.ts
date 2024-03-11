import Swal from "sweetalert2"

export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showCloseButton: false,
  showCancelButton: false,
  timer: 3000,
  timerProgressBar: false,
  icon: "success",
})

export const Confirm = Swal.mixin({
  showConfirmButton: true,
  showCloseButton: true,
  showCancelButton: true,
  timerProgressBar: false,
  heightAuto: false, // flexが崩れるため
  confirmButtonColor: "#369",
  confirmButtonText: "おけまる",
  cancelButtonColor: "#E5E7EB",
  cancelButtonText: "やっぱりいやだ",
  customClass: {
    title: "text-lg",
    confirmButton: "swl2-confirm-button-custom",
    cancelButton: "swl2-cancel-button-custom",
    actions: "swl2-actions-custom",
  },
})
