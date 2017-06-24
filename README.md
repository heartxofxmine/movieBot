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

### Initially Suggesting
A user can interact with a bot without knowing what they want to watch, and have FlickPick suggest a movie and give informative details pertaining to that movie. Users can ask more about the film, including who is in it, watching the trailer, and where to watch it.

This is accomplished by how Guidebox orders its data, in a huge array that can randomly be sorted through by offsets. Originally utilized through the MovieDB's API, it also could be randomly searched, but by pagination of objects, requiring nested callbacks of the randomization.

### Filtering Options
If the user is not interested in the initially suggested movie, and does not just want just another random suggestion, they can filter down on options including genres, actors, and the year for movies. ThemovieDB has an array of search capabilities that also provide paginated objects of films that fit the criteria that can keep randomization possible.

### Streaming
Combining calls to Guidebox and themovieDB help build objects in the ```APIhelper.js``` that have all relevant details about a given movie. This includes the strength of Guidebox, in providing information for all streaming availibilities for a given movie - subscription and purchase. Once a user has decided what they wish to watch, the Chat Bot will direct them seamlessly to the application or webpage (currently just webpage) of where they can view the movie.

## Technical Overview - How to work with this code

## How to build and run this sample project
1. Clone this repo
2. If you haven't already, download the [Microsoft Bot Framework Emulator](https://docs.microsoft.com/en-us/bot-framework/debug-bots-emulator)
3. ```npm install```
4. ```npm bot.js``` (or ```npm run build```)

## How to customize this project

## Limitations & Future Improvements
The focus of this bot was for Fandango but could serve the foundation for other streaming services. The work done for this prototype showed the power of combining multiple APIs and adjusting to the different constraints and limitations of each to still possibly address a partner problem, and even broader scale problem that audiences face and trying to find a solution. Therefore, this bot is applicable to more than just movies. 

Similar solutions could be addressed with partners in streaming, but even more broadly. It’s built in a way to have the backbone to be applied to any suggestions. Development can span other services to help audiences make decisions off of suggestions, like helping decide what to make for dinner when they are a store needing suggestions for activities to do when touring a city.

Initial work pertained to simple suggestions without aggregation or user profiles. Future work with a partner will hopefully build in saving data about user selections, as well as user profiles being set up to save movies to watch at a late date, what genres they do not wish to populate in suggestions, and what streaming services they have so that only movies in those selections would be provided. As partners become more engaged, we can integrate their user data into the bot to make even better suggestions to their audiences.
Implementing this bot as a Cortana skill could drive engagement with adding engagement channels. Adding LUIS integration would add more fluidity with misspellings of actor names and adding recognition to how people can ask ask for suggetions in a variety of ways. Adaptive Cards can also hopefully be added in making media experiences and interactions with Bots even stronger. 



## References

## Research

[Adobe XD Proof of Concept](https://xd.adobe.com/view/6b5d8575-0ed2-484d-af3b-ff5e7e717069/?featureset=0.6.15)

[Provide Your Experiences with Streaming](https://www.surveymonkey.com/r/GSHC5M2)




## Description
    Why I did this.
    What's the idea of the bot
## Features
    What I have : Search, random suggestion, etc
    What I want to do:


Not as people can use twitter, but that twitter can be an internet of things. pivot the convo about being about twitter, but rather pivot twitter to be about using major analytics.
here i'm connecting to public apis and leveraging that, but here's the power of combining multiple apis
the way i connected things, the different pieces i used, can be matched to numerous companies and disciplines. 
listen, i have an example where i did that movie data. here's how i connected it. 
here's why i chose this mthod, over another method. well id idn't know about that, or i did think about it, but chose this over another because of certain conditions.

If I had my own API and wanted to use this bot, how would I implement it.
What's hardcoded, what's not?
What lives in what files?
The dialogs are here, the apihelpers is here and does this. etc

steps to deploy, steps 
clone it, create an env with the following keys, 
here's how you'd install it, email me for more information.
this codes contains commented out samples to filter specific partners to specific services. 