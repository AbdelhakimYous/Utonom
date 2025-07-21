import { data } from "react-router-dom";
import { useState, useEffect } from "react";

function AfficherVns ()
{

    function fetchVns() {
        fetch('http://localhost:3000/api')
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.log(error))

    }	
        fetchVns();


    return (
        <div>
            <h1>Liste des VNs</h1>
            <ul>

            </ul>
        </div>
    );
}

export default AfficherVns