const livraisonSelect = document.getElementById('livraison');
const fraisBox = document.getElementById('fraisLivraisonBox');
const fraisInput = document.getElementById('frais');

livraisonSelect.addEventListener('change', () => {
  if (livraisonSelect.value === 'true') {
    fraisBox.style.display = 'block';
  } else {
    fraisBox.style.display = 'none';
    fraisInput.value = 0;
  }
  if (livraisonSelect.value === 'false') {
  data.livraison = {
    disponibilite: false,
    frais: 0
  };
} else {
  data.livraison = {
    disponibilite: true,
    frais: Number(fraisInput.value)
  };
}

});
