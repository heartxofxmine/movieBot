# FlickPick Movie Suggestion Bot on Microsoft Bot Framework

This is a suggestor chat bot on the Microsoft Bot Framework that helps a user discover movies on a partner’s platform and drive viewing engagement and hours of consumption, by providing randomly generated movies to users in a streamlined manner.

### Demo: [Full walkthrough of FlickPick](https://microsoft.sharepoint.com/teams/DXTechnicalWorkingGroups/Shared%20Documents/Media/FlickPick_Demo.mp4)

## Conceptual Overview & Features
This bot suggests movies to a user in a chat framework over traditional websites or applications because of the easy guided flow and directed interaction to help a user achieve a specific problem. It is meant as a channel to get them directed to experiencing the movie without first having to search all streaming services and comparing what each offers before making a decision. The handoff to applications or webpages is already intially integrated here, but could further be implemented as supplementary experiences to partners' databases and services. Having a Chat Bot for this allows for a user to solve a problem in selecting a movie faster without too much information overload, while still leveraging the more complex applications that partners already have.

It utilizes two 3rd Party APIs, themovieDB and Guidebox. 

[Guidebox API](https://api.guidebox.com/docs)

[MovieDB API](https://developers.themoviedb.org/3/)

[MovieDB npm Library Endpoints](https://github.com/impronunciable/moviedb/wiki/Library-endpoints)

[OMDB API](http://www.omdbapi.com/) (no longer in use due to Paywalls)

### The Initial Suggestion
A user can interact with a bot without knowing what they want to watch, and have FlickPick suggest a movie and give informative details pertaining to that movie. Users can ask more about the film, including who is in it, watching the trailer, and where to watch it.

This is accomplished by how Guidebox orders its data, in a huge array that can randomly be sorted through by offsets. Originally utilized through the MovieDB's API, it also could be randomly searched, but by pagination of objects, requiring nested callbacks of the randomization.

### Filtering Options
If the user is not interested in the initially suggested movie, and does not just want just another random suggestion, they can filter down on options including genres, actors, and the year for movies. ThemovieDB has an array of search capabilities that also provide paginated objects of films that fit the criteria that can keep randomization possible.

### Streaming Choices
Combining calls to Guidebox and themovieDB help build objects in the ```APIhelper.js``` that have all relevant details about a given movie. This includes the strength of Guidebox, in providing information for all streaming availibilities for a given movie - subscription and purchase. Once a user has decided what they wish to watch, the Chat Bot will direct them seamlessly to the application or webpage (currently just webpage) of where they can view the movie.

## How to build and run this sample project
1. Clone this repo
2. If you haven't already, download the [Microsoft Bot Framework Emulator](https://docs.microsoft.com/en-us/bot-framework/debug-bots-emulator)
3. Get API keys for guidebox and theMovieDB. theMovieDB provides free API keys for small testing use. Guidebox has a subscription of $1000/month. (Likewise, if you want, you can use this sample to implement with OMDB at a cheaper subscription cost, though you will lose streaming capabilities.)
3. ```npm install```, this should install all needed packages - including guidebox and mdb
4. ```npm bot.js``` (or ```npm run build```)

## Technical Overview - How to work with this code
This bot consists primarily of a waterfall chat framework without LUIS or Cortana integration. The bot application itself lives in ```bot.js```, with several calls made to ```apiHelper.js```. 

In starting, the bot is set up to run in an emulator, without ```MICROSOFT_APP_ID``` and  ```MICROSOFT_APP_PASSWORD``` defined. If you register this bot on the [Bot Framework](https://docs.microsoft.com/en-us/bot-framework/portal-register-bot), make sure to define these environment variables and set up ```ngrok``` to run (can also use [this site](https://docs.microsoft.com/en-us/bot-framework/deploy-bot-local-git) for further assistance.

Where theMovieDB and Guidebox excel is that they contain prepopulated lists of top movies. Not in a top-100 case, but as in the top 10,000+ movies. This allows for major randomization that won't deliver the same results all the time. However, in both APIs, they do not harness all of the details about a movie inside their respective lists, so you have to grab movie IDs in their libraries to get full details about the movie you're presenting to the user. 

#### /Suggestion dialog and getRandomMovie
```bot.js``` runs by first initializing a call with the root dialog to ```getRandomMovie``` inside of ```apiHelper.js```. 
This function first goes into Guidebox's list of movies at ```guidebox.movies.list```. It keeps them all on one "page", but finds different movies with it's ```offset``` parameter. Because the call is populated with 70k+ movies, keep suggestions from being too obscure by calling the length of the list and dividing the number, so the offset selected will be from the most popular 7k instead of 70k. Once that number is retrieved, call ```guidebox.movies.list``` again with the offest to grab the ```movieID``` and then call ```guidebox.movies.retrieve``` to get all the details pertaining to the movie, and fill that inside the ```moviedetails``` object. Once ```moviedetails``` is populated, the ```/Suggestion``` dialog provides a movieCard about the movie and buttons to the user for further actions.

Similarly, if another dialog calls for a Suggestion with a filtered option, the bot sends that information by having filled a "searchedBy" parameter inside movie details to make sure the Suggestion dialog retains the actor or genre searched for.

#### Search Filters
When you select a filter button from the ```/Another``` dialog, you need to grab the button selected, and send that to the proper dialog through args in the parameters for the dialog function.
The dialog then calls on the ```apiHelper``` to make search calls into theMovieDB or Guidebox, where search capabilities are available for those filters. In the case of actors, movies are provided in a list on Guidebox, but not for genres or years. When you select an actor, you can randomly select through their movies and display another one to the user, but in the case of the latter two, there are special search functions in theMovieDB. However, there is a limit in buttons available for displaying in the BotFramework, so buttons are limited to ten, and that means concatonating genres that are then randomly selected upon to search into depending what the user searches for. It grabs that genre ID, and then does a search in a prepopulated list, similar to the initial Suggesiton of movies, and randomly selects a movie through pagination and then random selections within 20 for each page.

#### /Yes for Streaming
As you'll see, there is commented code in the ```/Yes``` dialog. That is an example to cater the search results to one streaming service, if you wanted to do so.

Otherwise, the ```/Yes``` dialog calls on ```movieDetails```, which has in-all-intents-and-purposes, saves the streaming services as a dictionary in node. This way, when it comes to displaing the data, it can be called by called by ```Object.keys``` function with ```forEach```.

## How to customize this project
In calling a different API, you would need to check how it is called (ie: http request, callbacks, or promises), and then make sure the ```moviedetails``` object is filled with the information that is available. For all intents and purposes, if you use a different API, most all should work if you just change this. If you use something besides theMovieDB for filtering searches, you'll have to adjust the code for there as well.

## Limitations & Future Improvements
The focus of this bot was for Fandango but could serve the foundation for other streaming services. The work done for this prototype showed the power of combining multiple APIs and adjusting to the different constraints and limitations of each to still possibly address a partner problem, and even broader scale problem that audiences face and trying to find a solution. Therefore, this bot is applicable to more than just movies. 

Similar solutions could be addressed with partners in streaming, but even more broadly. It’s built in a way to have the backbone to be applied to any suggestions. Development can span other services to help audiences make decisions off of suggestions, like helping decide what to make for dinner when they are a store needing suggestions for activities to do when touring a city.

Initial work pertained to simple suggestions without aggregation or user profiles. Future work with a partner will hopefully build in saving data about user selections, as well as user profiles being set up to save movies to watch at a late date, what genres they do not wish to populate in suggestions, and what streaming services they have so that only movies in those selections would be provided. As partners become more engaged, we can integrate their user data into the bot to make even better suggestions to their audiences.
Implementing this bot as a Cortana skill could drive engagement with adding engagement channels. Adding LUIS integration would add more fluidity with misspellings of actor names and adding recognition to how people can ask ask for suggetions in a variety of ways. Adaptive Cards can also hopefully be added in making media experiences and interactions with Bots even stronger. 

## References & Research

[Adobe XD Proof of Concept](https://xd.adobe.com/view/6b5d8575-0ed2-484d-af3b-ff5e7e717069/?featureset=0.6.15)

[Provide Your Experiences with Streaming](https://www.surveymonkey.com/r/GSHC5M2)
