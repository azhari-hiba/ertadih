import Swal from 'sweetalert2'

export const successAlert = (title = 'تم بنجاح') => {
  Swal.fire({
    icon: 'success',
    title,
    confirmButtonColor: '#7a5c46',
  })
}

export const errorAlert = (title = 'وقع خطأ') => {
  Swal.fire({
    icon: 'error',
    title,
    confirmButtonColor: '#7a5c46',
  })
}

export const infoAlert = (title = 'معلومة') => {
  Swal.fire({
    icon: 'info',
    title,
    confirmButtonColor: '#7a5c46',
  })
}

/* toast صغير (واعر بزاف للسلة 🔥) */
export const toast = (title = 'تم') => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  })
}