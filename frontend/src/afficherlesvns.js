import { data } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {ErrorBoundary} from "react-error-boundary";


function AfficherVns ()
{


    function fetchVns() {
        fetch('http://localhost:3000/api')
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.log(error))

    }	
        fetchVns();

        const num = useRef(0);

        function addnum(){
            num.current += 1;
            alert(num.current);

        }

        const [nom, setnom] = useState('');
        const [preno, setprenom] = useState('');
        function changer(e)
        {
            setnom(e.target.value);
        }

        useEffect(()=>{


        },[num])

        function search(e)
        {
            console.log(nom);
            if(nom == "allo")
            {
                alert("bravo");
            }
            else
            {
                throw new Error('error');
            }
        }

        

    return (
        <div>
            <h1>Liste des VNs</h1>
            <ul>

            </ul>
            <ErrorBoundary
            fallback={<p>error</p>}
            >
    
        <form action={search}>
            <input name="allo" placeholder="nom" onChange={e =>setnom(e.target.value)} value={nom}></input>
            <input placeholder="prenom" onChange={e=>setprenom(e.target.value)} value={preno}></input>
            <button type="submit">search</button>


        </form>
            </ErrorBoundary>
        </div>

    );
}

export default AfficherVns