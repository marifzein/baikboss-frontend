import Swal from 'sweetalert2';

const theme = Swal.mixin({
  customClass: {
    confirmButton: 'swal2-confirm-bb',
    popup: 'swal2-popup-bb',
  },
  confirmButtonColor: '#7c3aed',
  buttonsStyling: false,
  showClass: { popup: 'swal2-show-bb', backdrop: 'swal2-backdrop' },
  hideClass: { popup: 'swal2-hide-bb' },
});

export default theme;
