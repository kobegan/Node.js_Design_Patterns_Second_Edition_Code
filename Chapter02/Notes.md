#2. Node.js Essential Patterns
    two of the most important asynchronous patterns: callback and event emitter
## The callback pattern
## The continuation-passing style
### Synchronous continuation-passing style
### Asynchronous continuation-passing style
![image](images/async.bmp)  
## Non-continuation-passing style callbacks
    the result is returned synchronously using a direct style.
## Synchronous or asynchronous?
### An unpredictable function
One of the most dangerous situations is to have an API that behaves synchronously under
certain conditions and asynchronously under others. Let's take the following code as an
example:
```javascript
const fs = require('fs');
const cache = {};
function inconsistentRead(filename, callback) {
    if(cache[filename]) {
        //invoked synchronously
        callback(cache[filename]);
    } else {
        //asynchronous function
        fs.readFile(filename, 'utf8', (err, data) => {
            cache[filename] = data;
            callback(data);
        });
    }
}
```
### Unleashing Zalgo
Now, let's see how the use of an unpredictable function, such as the one that we defined
previously, can easily break an application. Consider the following code:
```javascript
function createFileReader(filename) {
    const listeners = [];
    inconsistentRead(filename, value => {
        listeners.forEach(listener => listener(value));
    });
    return {
        onDataReady: listener => listeners.push(listener)
    };
}
```
### Using synchronous APIs
The lesson to learn from the unleashing Zalgo example is that it is imperative for an API to
clearly define its nature: either synchronous or asynchronous.
###Deferred execution
Another alternative for fixing our inconsistentRead() function is to make it purely
asynchronous.The trick here is to schedule the synchronous callback invocation to be
executed “in the future” instead of being run immediately in the same event loop cycle. In
Node.js, this is possible using process.nextTick(), which defers the execution of a
function until the next pass of the event loop.

## Node.js callback conventions

### Callbacks come last
```javascript
fs.readFile(filename, [options], callback)
```
### Error comes first
```javascript
fs.readFile('foo.txt', 'utf8', (err, data) => {
    if(err)
        handleError(err);
    else
        processData(data);
});
```
It is best practice to always check for the presence of an error, as not doing so will make it
harder for us to debug our code and discover the possible points of failure. Another
important convention to take into account is that the error must always be of type Error.
This means that simple strings or numbers should never be passed as error objects.
### Propagating errors
Propagating errors in synchronous, direct style functions is done with the well-known
throw statement, which causes the error to jump up in the call stack until it is caught.
In asynchronous CPS however, proper error propagation is done by simply passing the
error to the next callback in the chain.
```javascript
const fs = require('fs');
function readJSON(filename, callback) {
    fs.readFile(filename, 'utf8', (err, data) => {
        let parsed;
        if(err)
            //propagate the error and exit the current function
            return callback(err);
        try {
            //parse the file contents
            parsed = JSON.parse(data);
            } catch(err) {
            //catch parsing errors
            return callback(err);
        }
        //no errors, propagate just the data
        callback(null, parsed);
    });
}
```
### Uncaught exceptions
Throwing inside an asynchronous callback will cause the exception
to jump up to the event loop and never be propagated to the next callback.
In Node.js, this is an unrecoverable state and the application will simply shut down
printing the error to the stderr interface.
```javascript
process.on('uncaughtException', (err) => {
    console.error('This will catch at last the ' + 'JSON parsing exception: ' + err.message);
    // Terminates the application with 1 (error) as exit code:
    // without the following line, the application would continue
    process.exit(1);
});
```

## The module system and its patterns
### The revealing module pattern
One of the major problems with JavaScript is the absence of namespacing.A popular technique to solve this problem is called the revealing module
pattern, and it looks like the following:
```javascript
const module = (() => {
    const privateFoo = () => {...};
    const privateBar = [];
    const exported = {
        publicFoo: () => {...},
        publicBar: () => {...}
    };
    return exported;
})();
console.log(module);
```
This pattern leverages a self-invoking function to create a private scope, exporting only the
parts that are meant to be public.
## Node.js modules explained
***CommonJS modules***
### A homemade module loader

