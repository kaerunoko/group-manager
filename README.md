# GroupManagerApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

note: we should make the method used in template public in Angular5.
Keeping them private, `ng build -prod --aot=false`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Note
## Without server
Run `ng serve --env=mock` for develop mode with mock Google API, without any server.

## Upload
1. `ng build --env=prod` or `ng build -prod --build-optimizer=false`; see: https://github.com/angular/angular-cli/issues/8505
2. `gcloud app deploy`
3. `gcloud app browse`
