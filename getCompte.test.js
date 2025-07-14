const getRetrait = require('./getCompte');

test('tester si le retrait marche', () => {

    const number = 100;
    expect(getRetrait(number)).toBe("Retrait de 100 euros effectué. Nouveau solde: 4900 euros.");
    const number2 = 20;
    expect(getRetrait(number2)).toBe("Retrait de 20 euros effectué. Nouveau solde: 4980 euros.");
});