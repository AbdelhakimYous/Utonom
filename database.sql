CREATE DATABASE Utonome;
CREATE Table Utilisateur 
    (id INT not null AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,                          
    email VARCHAR(50) NOT NULL UNIQUE,
    motdepasse VARCHAR(150) NOT NULL);

CREATE TABLE Role
    (id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL);

CREATE TABLE RoleUtilisateur
     (utiliId int,
      FOREIGN KEY (utiliId) REFERENCES Utilisateur(id),
      roleId int,
      FOREIGN KEY (roleId) REFERENCES Role(id));