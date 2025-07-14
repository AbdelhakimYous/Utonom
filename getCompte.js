function getRetrait(nb)
{
    let solde = 5000;
    if(solde <nb)
    {
        return `Montant de retrait invalide : ${nb} euros. Solde actuel: ${solde} euros.`;
    }
    if(nb % 20 == 0)
    {
        solde -= nb;
        return "Retrait de " + nb + " euros effectué. Nouveau solde: " + solde + " euros.";
    }
}

module.exports = getRetrait;