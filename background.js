chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    let myResponseHeaders = details.responseHeaders;

    let isPDF = false;
    let changeContentType = false;
    const re = new RegExp('.*filename="[^"]*\.pdf"');

    details.responseHeaders.forEach(val => {
      if (val.name.toLowerCase() == 'content-disposition' && re.test(val.value)) {
        isPDF = true;
        changeContentType = true;
      }
      if (val.name.toLowerCase() == 'content-type' && val.value.toLowerCase() == 'application/pdf') {
        isPDF = true;
        changeContentType = false;
      }
    });

    if (!isPDF) {
      return { responseHeaders: myResponseHeaders};
    }

    let header = myResponseHeaders.find(e => e.name.toLowerCase() == 'content-disposition');

    if (header) {
        console.log ('Modifying content-disposition header');
        let headerIndex = myResponseHeaders.indexOf(header);
        myResponseHeaders.splice(headerIndex,1);
    } else {
      return { responseHeaders: myResponseHeaders};
    }

    let newValue = '';
    const exploded = header.value.split(';');
    exploded.forEach(x => {
      if (x == 'attachment') {
        newValue += 'inline';
      } else {
        newValue += x;
      }
      newValue += ';';
    });
    newValue = newValue.slice(0,-1);

    myResponseHeaders.push({ name: 'content-disposition', value: newValue });

    if (!changeContentType) {
      return { responseHeaders: myResponseHeaders};
    }

    header = myResponseHeaders.find(e => e.name.toLowerCase() == 'content-type');

    if (header) {
        console.log ('Modifying content-type header');
        let headerIndex = myResponseHeaders.indexOf(header);
        myResponseHeaders.splice(headerIndex,1);
    } else {
      return { responseHeaders: myResponseHeaders};
    }

    myResponseHeaders.push({ name: 'content-type', value: 'application/pdf' });


    return { responseHeaders: myResponseHeaders};
  },

  {
    urls: ["https://*/*", "http://*/*"],
  },

  ["blocking", "responseHeaders", "extraHeaders"]
);