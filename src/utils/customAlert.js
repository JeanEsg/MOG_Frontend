import Swal from "sweetalert2";

export const showCustomAlert = async ({
  title = "Alerta",
  text = "",
  html = "",
  icon = "info",
  confirmButtonText = "Aceptar",
  cancelButtonText = "Cancelar",
  showCancelButton = false,
  preConfirm = null,
}) => {
  const result = await Swal.fire({
    title,
    text,
    html,
    icon,
    iconColor: "#1d4ed8",
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#1d4ed8",
    cancelButtonColor: "#6b7280",
    background: "#ffffff",
    customClass: {
      popup: "swal2-rounded",
      confirmButton: "swal2-confirm-custom",
      cancelButton: "swal2-cancel-custom",
    },
    preConfirm,
  });

  return result;
};
