# zer0gear's Tavern Card Editor
A tool for editing tavern/character cards with more granularity than most popular AI chatbot frontends.

## Who is this for?
Short answer, probably just me. Popular frontends such as [Chub/Chub Venus](https://chub.ai/) and [SillyTavern](https://sillytavern.app/) offer robust card creation and editing capabilities and will be sufficient for 99% of card creators.

The long answer is anyone who finds themselves having to open a given card's JSON in their editor of choice to make changes that are otherwise not possible or feasible in their chosen frontend. This may be due to a lack of features such as being able to arbitrarily reorder greetings, generating cards compliant to both Chub and SillyTavern lorebook specs, and arbitrarily replacing card JSONs while retaining their display picture or replacing their pictures while retaining their metadata. If these features do not interest you, you would likely better served by using your frontend as normal. Otherwise, this tool may be for you.

## What can this tool not do?
First and foremost, ***this is not a frontend for AI chatbots***. You can create, edit, and export character cards, but ***you cannot chat with your cards using this tool***. This tool makes no external API calls and is purely for editing cards. Anything along the lines of using or testing cards is outside of the scope of this tool and its planned features.

Additionally, you can export your edited and created cards, but bulk management of your cards also falls outside of the scope of this tool. This tool aims to serve as a *compliment* to your favorite frontend, not as a *replacement*.

## Usage
Clone, npm install, npm start

Live page and more detailed instructs TBA

## Other notes and considerations
This tool was written in Javascript using [React](https://react.dev/) and heavily utilizes the [Material UI](https://mui.com/) library.

PNG-related logic was largely written with assistance from ChatGPT because I am but a silly little guy and that stuff is wizardry to me.