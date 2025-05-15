//Etat de l'application (données)
const bankAccount = {
	balance: 0,
	transactions: [],
};

//Sélection des éléments du DOM
const addButton = document.querySelector("#ajouter");
const typeSelect = document.querySelector("#type");
const soldeElement = document.querySelector("#solde");
const listeOperations = document.querySelector("#liste-operations");
const descriptionInput = document.querySelector("#description");
const montantInput = document.querySelector("#montant");

//Fonction Utilisateur
function userDisplay() {
	const name = prompt("Quel est ton prénom ?");

	document.querySelector("#title").textContent = `Compte bancaire de ${name}`;
}
//Mettre à jour l'affichage du solde
function updateBalance() {
	soldeElement.textContent = `${parseFloat(bankAccount.balance)} €`;
}

//Ajouter une opération
function addOperation(description, montant, type) {
	if (!description || description.trim() === "") {
		alert("La description est obligatoire !");
		return false;
	}

	if (isNaN(montant) || montant < 0) {
		alert("Veuillez entrer un nombre positif");
		return false;
	}

	if (type === "debit" && montant > bankAccount.balance) {
		alert("Solde insuffisant");
		return false;
	}

	const operation = {
		description: description,
		montant: montant,
		type: type,
	};

	if (type === "credit") {
		bankAccount.balance += montant;
	} else {
		bankAccount.balance -= montant;
	}

	bankAccount.transactions.push(operation);

	console.log("transaction ajoutée !", bankAccount.transactions);
	return true;
}

function displayOperations() {
	listeOperations.innerHTML = "";

	bankAccount.transactions.forEach((operation) => {
		const li = document.createElement("li");

		li.textContent = `${operation.description} | ${operation.montant}€ | ${operation.type}`;
		listeOperations.appendChild(li);
	});
}

//Gestionnaire d'événement
addButton.addEventListener("click", () => {
	const description = descriptionInput.value;
	const montant = parseFloat(montantInput.value);
	const type = typeSelect.value;

	const success = addOperation(description, montant, type);

	if (success === true) {
		updateBalance();
		displayOperations();
	} else {
		console.log("success = false");
	}
});

userDisplay();
updateBalance();
displayOperations();
