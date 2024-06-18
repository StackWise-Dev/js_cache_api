// _________________ SIMPLE PUT METHOD FOR NETWORK JSON FETCHING ________________
async function getCacheData() {
    let cache = await caches.open("storeData");
    
    let response = await cache.match("https://jsonplaceholder.typicode.com/todos");
    if(response) {
        console.log("Result from Cache....")
        console.log(await response.json());
    } else {
        let request = await fetch("https://jsonplaceholder.typicode.com/todos");
        if(request.ok) {
            await cache.put(new Request("https://jsonplaceholder.typicode.com/todos"), request.clone());
            let data = await request.json();
            console.log("from cached storage: ", data)

        }
    }
}
getCacheData();

// ____________________ STORE WHOLE PAGE USING SERVICE WORKER _______________________
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/script.js')
      .then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(function(error) {
        console.error('Service Worker registration failed:', error);
      });
}
  
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("vol-1")
        .then(cache => {
            cache.addAll([
                "/",
                "./index.html",
                "./script.js",
                "./groot.jpg",
            ]);
        })
        .catch(error => console.log(error))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            if(response !== undefined) {
                return response;
            } else {
                return fetch(event.request)
                .then((response) => {
                    let responseClone = response.clone();

                    caches.open("vol-1")
                    .then((cache) => {
                        // stop other chrome-extension request to generate errors
                        if(!event.request.url.startsWith('http')) return;
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch((e) => console.log(e));
            }
        })
    );
});








// ________________ SIMPLE REQUEST ________________
// async function getNetWorkResponseToStore() {

//     // Open a cache with the name "storedata"
//     let cache = await caches.open("storedata");

//     // Add a request to the cache
//     await cache.add(new Request("https://jsonplaceholder.typicode.com/todos"));

//     // Match the request in the cache to retrieve the response
//     let response = await cache.match("https://jsonplaceholder.typicode.com/todos");

//     // If a response is found, log the JSON data
//     if (response) {
//         let data = await response.json();
//         console.log(data);
//     } else {
//         console.log("No response found in the cache.");
//     }
// }
// getNetWorkResponseToStore();


// _________________ SIMPLE REQUEST MULTI STORE AND GET _____________
// async function storeRequest() {
//     let cache = await caches.open("storeData");
//     await cache.addAll(["https://jsonplaceholder.typicode.com/todos", "https://jsonplaceholder.typicode.com/todos/1"]);

//     let keys = await cache.keys();
//     for(let request of keys) {
//         let response = await cache.match(request);
//         // let response = await cache.matchAll(request);
        
//         if(response) {
//             console.log("Data for: ", request.url, await response.json())
//         } else {
//             console.log("No data for: ", request.url)
//         }
//     }

// }

// storeRequest();


// ________________ SIMPLE METHOD WITH MATCH OPTIONS __________________
// async function getCacheData() {
//     let cache = await caches.open("storeData");
//     await cache.add(new Request("https://jsonplaceholder.typicode.com/todos?id=2", {method: "GET"}));
//     let response = await cache.match("https://jsonplaceholder.typicode.com/todos?id=2",{
//         ignoreSearch: false,  // IGNORE SEARCH QUERY IN THE REQUEST
//         ignoreMethod: false,  // IGNORE GET, POST METHODS WHEN SEARCH
//         ignoreVary: true      // IGNORE HEADER VARIATION WHEN SEARCH
//     });

//     if(response) {
//         console.log(response.url, await response.json())
//     } else {
//         console.log("No data in cache")
//     }
// }   

// getCacheData();






// __________________ EXAMPLE 1 ___________________
// console.log('caches' in self);
// let cache;

// async function storeCache() {
//     // FILTER IF DATA IS ALREADY IN THE CACHE
//     let url = "https://jsonplaceholder.typicode.com/todos";
//     let storeData = await getStoreData(url, 'mystore');
//     if(storeData) {
//         console.log('fetching stored data');
//         return storeData;
//     }

//     // IF NO DATA IN THE CACHE THEN SOTRE A COPY TO IT
//     console.log("fetching fresh data");
//     cache = await caches.open("mystore");
//     await cache.add(url);
//     storeData = await getStoreData(url, 'mystore');
//     await deleteCache('mystore');
//     return storeData;
// }

// // GET THE STORED DATA FROM THE CACHE
// async function getStoreData(url, storeName) {
//     cache = await caches.open(storeName);
//     let data = await cache.match(url);
//     if(!data || !data.ok) {
//         return false;
//     }
//     return await data.json();
// }

// // DELETE THE OLD DATA TO CLEAN THE GARBAGE
// async function deleteCache(currentCache) {
//     let keys = await caches.keys();
//     for(let key of keys) {
//         let cacheKey = key.startsWith('mysto');
//         if(currentCache === key || !cacheKey) {
//             console.log("key matches");
//             continue;
//         }
//         caches.delete(key);
//     }
// }

// // FETCH THE DATA AND RETURN THE RESULT 
// try {
//     let data = storeCache();
//     data
//     .then(result => console.log(result))
//     .catch(error => console.log(error))
// } catch(e) {
//     console.log(e)
// }




// ____________________ EXAMPLE TWO ______________________
// let cache;
// async function storeCache() {
//     // CHECK IF DATA IN THE CACHES THEN RETURN IT
//     let url = ["https://jsonplaceholder.typicode.com/todos", "https://jsonplaceholder.typicode.com/todos/1"];
//     let storeData = await getStoreData(url, 'mystore');

//     if(storeData) {
//         console.log('fetching stored data');
//         return storeData;
//     }

//     // IF NO DATA IN CACHE STORE IT AND RETURN IT
//     console.log("fetching fresh data");
//     cache = await caches.open("mystore");
//     await cache.addAll(url);
//     storeData = await getStoreData(url, 'mystore');
//     // DELETE OLD DATA IF NOT NEEDED
//     await deleteCache('mystore');
//     return storeData;
// }

// async function getStoreData(urls, storeName) {
//     cache = await caches.open(storeName);
//     let dataArray = [];

//     // GETTING ALL URLS TO FILTER THE DATA OUT OF IT
//     for(let url of urls) {
//         let data = await caches.match(url);
//         if(data || data.ok) {
//             dataArray.push(await data.json());
//         }
//     }

//     if(dataArray.length > 0) {
//         return dataArray;
//     } else {
//         return false;
//     }
// }

// DELETE OLD DATA FROM THE CACHE
// async function deleteCache(currentCache) {
//     let keys = await caches.keys();
//     for(let key of keys) {
//         let cacheKey = key.startsWith('mysto');
//         if(currentCache === key || !cacheKey) {
//             continue;
//         }
//         caches.delete(key);
//     }
// }

// RETURN THE RESULT TO PRINT THE CACHED DATA
// try {
//     let data = storeCache();
//     data
//     .then(result => console.log(result))
//     .catch(error => console.log(error))
// } catch(e) {
//     console.log(e)
// }

// ____________________ STORING IMAGES INTO THE CACHE _______________________
// async function storeImages() {
//     let cache = await caches.open('mystore-cache');
//     let result = await cache.match('https://picsum.photos/200/300');
//     if(result) {
//         console.log("Image From Cache");
//         let getImage = await result.blob();
//         document.querySelector("img").src = URL.createObjectURL(getImage);
//     } else {
//         let response = await fetch('https://picsum.photos/200/300');
//         if(response.ok) {
//             await cache.put('https://picsum.photos/200/300', response.clone());
//             console.log("image is stored to cache")
//             let getImage = await response.blob();
//             document.querySelector("img").src = URL.createObjectURL(getImage);
//         }
//     }
// }

// storeImages();


