/*   -----------

Name : Samuel Benison Jeyaraj Victor
Email ID : sambenison66@gmail.com
Project Link : http://omega.uta.edu/~xxx1234/project2/movies.html

------------ */

// Main Method
function MovieApp(){
    // initialization of Movie App object
}

// The first method called when 'Display Info' button is clicked
MovieApp.sendRequest = function(){
    document.querySelector("#title").innerText = "";  // Clear the existing Title if available
    while(document.getElementById("poster").hasAttribute("src")) {   // Clear the poster image if available
        document.querySelector("#poster").removeAttribute("src");
    }
    while(document.getElementById("cast").hasChildNodes()) {    // Clear the cast info if available
         document.querySelector("#cast").removeChild(document.querySelector("#cast").firstChild);   
    }
    while(document.getElementById("overview").hasChildNodes()) {   // Clear the overview if available
         document.querySelector("#overview").removeChild(document.querySelector("#overview").firstChild);   
    }
    // First AJAX method called to send the query to the PHP file
    var xhr = new XMLHttpRequest();
    var query = encodeURI(document.getElementById("form-input").value);
    xhr.open("GET", "proxy.php?method=/3/search/movie&query=" + query);  // Query to send the movie name and get the JSON result of movie list
    xhr.setRequestHeader("Accept","application/json");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
           var json = JSON.parse(this.responseText);    // Getting the result back and storing it in a variable
           var destination_element = document.querySelector("#movielistings");   // Searching for an element with id name 'movielistings'
           MovieApp.response = json;
           MovieApp.showListings(json,destination_element);   //  Calling the method showListing
        }
    };
    xhr.send(null);
  }; 

// Method to get the details for the selected movie name
MovieApp.getDetail = function(json,element,callback){
    var mid = json.id;
    if(!MovieApp.createMovieListing(mid,element)){return;};
    // Second AJAX method called to send the query to the PHP file
    var xhr = new XMLHttpRequest();
    var query = encodeURI(document.getElementById("form-input").value);
    xhr.open("GET", "proxy.php?method=/3/movie/" + mid);  // Query to send the movie id and get the JSON result of movie details
    xhr.setRequestHeader("Accept","application/json");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
           var respJson = JSON.parse(this.responseText);
            console.log("-------------");  // Sending the JSON value to console
            console.log(respJson);
            console.log("-------------");
           callback(respJson,element);  // Calling the callback method back to the called function
        }
    };
    xhr.send(null);
}

// Method to get the cast for the selected movie name
MovieApp.getCast = function(json,element,callback){
    var mid = json.id;
    if(!MovieApp.createMovieListing(mid,element)){return;};
    // Third AJAX method called to send the query to the PHP file
    var xhr = new XMLHttpRequest();
    var query = encodeURI(document.getElementById("form-input").value);
    xhr.open("GET", "proxy.php?method=/3/movie/"+mid+"/credits");  // Query to send the movie id and get the JSON result of movie cast
    xhr.setRequestHeader("Accept","application/json");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
           var json = JSON.parse(this.responseText);
           callback(json,element);   // Calling the callback method back to the called function
        }
    };
    xhr.send(null);
};

// Method to show the list of movies based on the selected query
MovieApp.showListings = function(json,element){
    console.log("GOT HERE!");
    var listing = document.createElement("ul");  // Create a list and list all the movies in the listing
    json.results.forEach(function(entry){
        console.log(entry.original_title);
        var movie = document.createElement("li");
        var link = document.createElement("a");
        link.onclick = function(evt){  // OnClick event to capture the clicked movie from the Movie List
            evt.stopPropagation();
            evt.preventDefault();
            MovieApp.showDetail(entry,document.querySelector("#moviedetail"));
        };
        var linkhref = "#";
        link.setAttribute("href",linkhref)
        link.innerText = entry.original_title;
        movie.appendChild(link);
        listing.appendChild(movie);
    });
    while(element.hasChildNodes()){ element.removeChild(element.firstChild);}//remove children before listing
    element.appendChild(listing)  // Attach the listing as the child
};

// Method to show the movie details of the clicked movie
MovieApp.showDetail = function(json,element){
  var mid = json.id;
  MovieApp.getDetail(json, element.querySelector("#overview"),function(resp,container){   // Calling the Get Detail method
    var title = resp.original_title;
    document.querySelector("#title").innerText = "'" + title + "'";   //  Display the Title of the Selected Movie
    var overview = resp.overview || "The Overview was not available";
    var genres = "";
    resp.genres.forEach(function(entry){
        console.log(entry);
        genres += entry.name + ", "  // Listing all the genres with comma to seperate
    });
    genres = genres || "No genres specified, ";  // Get the value or assign a default value if null
    genres = genres.substring(0, genres.length - 2);  // 
    container.innerText = "["+ genres + "] " + " - " + overview
    element.appendChild(container);    //  Display the Genre and Overview of the Selected Movie
  });
  MovieApp.getCast(json, element.querySelector("#cast"),function(resp,container){   // Calling the gerCast method
    var cast = resp.cast;
    if(cast.length != 0){
        for(var inc=0;inc<5;inc++){
        var tmpL = document.createElement("li");  // List the cast
        tmpL.innerText = cast[inc].name;
        container.appendChild(tmpL);   //  Display the Cast of the Selected Movie
        }
    }else{
        container.innerText = "No Cast Details available";  // Default value if no cast available
    }
  });
  MovieApp.getPosterImage(json.poster_path,element.querySelector("#poster"), function(resp,container){  // Calling the getPosterImage method
        container.setAttribute("src",resp);  // Setting the attribute of IMG with the received link
  });
};

// Method to get the link of the selected movie poster
MovieApp.getPosterImage = function(rel, element,callback){
    var link;
    if (rel==null) {
        link = "";
    } else {
        link = "https://image.tmdb.org/t/p/w185" + rel;  // Attach the default prefix to the poster path
    }
    callback(link,element);
};

// Method to create the Movie Listing
MovieApp.createMovieListing = function(mid, element){
    if(element.movieID == mid){
        console.log("already loaded");
        return false;}
    while(element.hasChildNodes()){ element.removeChild(element.firstChild);} //remove children
    element.movieID = mid;
    return true;
};