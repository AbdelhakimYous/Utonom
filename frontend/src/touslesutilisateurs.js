

function Lesutilisateurs ({nom, prenom})
{

    function getdata(FormData)
    {
        const nom1 = FormData.get("nom")
        const prenom = FormData.get("prenom")
        console.log(nom1);
        console.log(prenom);
    }


    return (


    <form action={getdata}>
        <input  name="nom" value={nom}></input>
        <input  name="prenom" value={prenom}></input>
        <button type="submit">Add to Cart</button>
    </form>
        
    )
}


export default Lesutilisateurs;
