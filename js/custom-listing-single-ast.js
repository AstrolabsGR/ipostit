const modal = document.getElementById('offerModal');
const btn = document.getElementById('offerBtn');
const span = document.querySelector('.offer-close');

btn.onclick = () => {
    modal.style.display = 'flex';
    document.body.classList.add('modal-active');
};

span.onclick = () => {
    modal.style.display = 'none';
    document.body.classList.remove('modal-active');
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-active');
    }
};

document.getElementById('counterOfferForm').onsubmit = function (e) {
    e.preventDefault();
    const amount = document.getElementById('offerPrice').value;

    alert(`Η προσφορά σου (€${amount}) καταχωρήθηκε επιτυχώς!`);

    modal.style.display = 'none';
    document.body.classList.remove('modal-active');
    this.reset();
};

const phoneBtn = document.getElementById('phoneBtn');
const phonePopup = document.getElementById('phonePopup');
const closePopup = document.getElementById('closePopup');
const popupOverlay = document.getElementById('popupOverlay');

phoneBtn.addEventListener('click', () => {
    phonePopup.style.display = 'block';
    popupOverlay.style.display = 'block';
    document.body.classList.add('modal-active');
});

closePopup.addEventListener('click', () => {
    phonePopup.style.display = 'none';
    popupOverlay.style.display = 'none';
    document.body.classList.remove('modal-active');
});

popupOverlay.addEventListener('click', () => {
    phonePopup.style.display = 'none';
    popupOverlay.style.display = 'none';
    document.body.classList.remove('modal-active');
});
