### DoubleClick headers ###

Les headers Double-Click sont facultatifs, et permettent d'influer sur le dédoublonnage appliqué aux ECs. En l'absence de modifications, le dédoublonnage est réalisé en suivant l'algorithme du code de bonnes pratiques COUNTER. (consultable à la page 4 de l'annexe D disponible à [cette adresse](http://couperin.org/images/stories/documents/Statistiques/COUNTER/V4_FR/appd_fr.pdf))  

Ils peuvent s'écrire *(en couleur les zones variables)* de la façon suivante :

Double-Click-Removal: <span style="color: red">true</span>  
Double-Click-HTML: <span style="color: red">10</span>  
Double-Click-PDF: <span style="color: red">30</span>  
Double-Click-MISC: <span style="color: red">20</span>  
Double-Click-Strategy: <span style="color: red">CLI</span>  
Double-Click-C-field: <span style="color: red">NomDuChampCookie</span>  
Double-Click-L-field: <span style="color: red">NomDuChampLogin</span>  
Double-Click-I-field: <span style="color: red">NomDuChampHost</span>  


#### Paramètres (headers) ####

-   **Double-Click-Removal:** application ou non du dédoublonnage COUNTER *(true par défaut)*. Si ce header est utilisé, c'est que le dédoublonnage n'est pas souhaité (valeur *false*) et les autres headers Double-Click- sont inutiles.
-   **Double-Click-HTML:** délai utilisé, en secondes, pour définir l'intervalle minimal entre deux requêtes considérées comme identiques pour la consultation d'un [EC au format HTML](./ec-attributes.html#formats-de-ressources) *(10 par défaut)*.
-   **Double-Click-PDF:** délai utilisé, en secondes, pour définir l'intervalle minimal entre deux requêtes considérées comme identiques pour la consultation d'un [EC au format PDF](./ec-attributes.html#formats-de-ressources) *(30 par défaut)*.
-   **Double-Click-MISC:** délai utilisé, en secondes, pour définir l'intervalle minimal entre deux requêtes considérées comme identiques pour la consultation d'un [EC au format MISC](./ec-attributes.html#formats-de-ressources) *(ni HTML, ni PDF)* *(20 par défaut)*.
-   **Double-Click-Strategy:** stratégie utilisée pour définir l'unicité de l'utilisateur consultant la ressource sous forme d'une suite de lettres ordonnées. Les champs sont recherchés dans l'ordre et le suivant est pris en cas d'absence. La lettre **C** correspond au champ contenant le **cookie** (ou l'identifiant de **session**). La lettre **L** correspond au **login** de l'utilisateur. La lettre **I** correspond à l'**adresse IP** contenue dans le champ host. *(CLI par défaut)*
-   **Double-Click-C-field:** nom du champ à rechercher dans les logs, utilisé pour tracer le cookie identifiant l'utilisateur ou son identifiant de session et issus des [paramètres personnalisés du format de log](./formats.html#paramtres-personnaliss). Par défaut, il n'est pas possible de connaître le champ utilisé s'il n'est pas précisé dans les paramètres personnalisés du format de log. *(ignoré par défaut)*
-   **Double-Click-L-field:** nom du champ à rechercher dans les logs, utilisé pour indiquer le login de l'utilisateur *(correspondant à %u dans la [syntaxe définissant le format de log](./formats.html))*. *(%u par défaut)*.
-   **Double-Click-I-field:** nom du champ à rechercher dans les logs, utilisé pour indiquer le host de l'utilisateur *(correspondant à %h dans la [syntaxe définissant le format de log](./formats.html))*. *(%h par défaut)*.


Exemple d'usage :
```shell
curl -v -X POST --proxy "" --no-buffer\
  -F "file=@test/dataset/sd.duplicates.log"\
  -H 'Log-Format-ezproxy: %h %u %{session}<[a-zA-Z0-9\\-]+> %t "%r" %s'\
  -H 'Double-Click-HTML: 15'\
  -H 'Double-Click-PDF: 30'\
  -H 'Double-Click-MISC: 40'\
     http://127.0.0.1:59599
```