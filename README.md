# webapp-starter — the seed for the VentureHacks tech session


## Getting Started

To get you started you can simply clone the webapp-starter repository 
and install the dependencies. If you get lost, either yell my name out and flail 
or use git to pull the next step down.

### Prerequisites

Have installed:
- node
- npm
- git

### Clone webapp-starter

Clone the webapp-starter repository using [git][git]:

```bash
git clone -b step-0 https://github.com/venture-hacks/webapp-starter.git
cd webapp-starter
```

The ```-b step-0``` specifies the branch to clone. We will start with the 'step-0' branch.  
If you get lost along the way, feel free to just clone the branch at our current step.  
You can also 'pull' the step's branch that you want with git like so:

```bash
    git checkout {step's branch}
```

### Install Dependencies

* We get the development and server side tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

```bash
npm install
npm install -g bower
bower install
```

You should find that you have two new folders in your project. Let me know if you do not.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework and client-side dependency files

*Note that the `bower_components` folder would normally be installed in the root folder but
webapp-starter changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

## Directory Layout

```
app/                    --> all of the source files for the application
  components/           --> all app specific modules and directives
  app.css               --> default stylesheet
  app.js                --> main application module
  index.html            --> app layout file (the main html template file of the app)
```

## To Run App

We will write the server to handle small functions on the backend and serve the Angular app on port 8080.

```node
node server.js
```

or

```bash
npm run serve
```

## Improvements to this app (??)
- Dynamic scaling is needed!
- What else do you think?

## Further Reading:
    Ask me!

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://jasmine.github.io
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
