## Projet 2 : 



Le serveur héberge plusieurs sites web, ayant des niveaux de priorité et des consommations différentes. Lorsque l'énergie disponible devient limitée, le serveur doit s’adapter



## arbitrer sites / pages / services 



- entre les différents sites afin de prolonger au maximum son autonomie (possible de définir des niveaux de priorité entre sites)

- Pour un seul site définir les routes d’aPI/pages/calculs qui doivent être encore accessibles



Il faut créer un daemon qui vérifie l’état de la batterie



Exemple : 





### Niveau 0 — arrêt



Le serveur est totalement arrêté.



### Niveau 1 — survie



Seuls les services indispensables fonctionnent :



* page d'accueil ;

* état énergétique ;

* informations d'urgence ;

* mécanisme de reprise.



### Niveau 2 — économie



Les services principaux fonctionnent mais certaines fonctionnalités sont désactivées :



* images supprimées ;

* vidéos interdites ;

* recherches limitées ;

* traitements lourds désactivés.



### Niveau 3 — fonctionnement normal



Tous les services sont disponibles.



### Niveau 4 — énergie abondante



Lorsque la batterie est pleine et que la production solaire est importante, certains traitements peuvent être réalisés en avance :



* génération de cache ;

* calculs ;

* compression ;

* préparation des contenus hors ligne ;

* génération de documents ;

* pré-calcul des pages.



## Optimiser la partie technique (ecoconception)





Vous pourrez notamment travailler sur :



De la mesure

Le serveur réalise automatiquement un audit avec Playwright :

* poids transféré ;

* nombre de requêtes ;

* ressources ;

* images ;

* JavaScript ;

* DOM ;

* temps de chargement ;

* etc.



De l’optimisation 



Les étudiants mettent en œuvre les stratégies :

* compression ;

* cache ;

* images adaptées ;

* lazy loading ;

* génération statique ;

* réduction JS ;

* pré-calcul ;

* etc.







Voir https://playwright.dev/ ou https://pptr.dev/ pour récupérer toutes ces informations.

Il faut un Dashboard qui résume toutes ces infos pour l’admin du site.



### Inventer un nouveau système de cache



Le cache classique répond généralement à une logique technique : "Cette ressource a-t-elle déjà été demandée ?"



Il faut imaginer un cache prédictif en fonction de l’énergie qui sera disponible. Il peut alors décider de préparer les contenus qui seront probablement utiles pendant son absence.

