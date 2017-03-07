(function() {
        var params = {
            // Request parameters
            "q": "bill gates",
            "count": "10",
            "offset": "0",
            "mkt": "en-us",
            "safesearch": "Moderate",
        };
      
        this.ajax({
            url: "https://api.cognitive.microsoft.com/bing/v5.0/search?" + $.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","df6ec00e3a1b43a983f22ed8e4f50ddc");
            },
            type: "GET",
            // Request body
            data: "{body}",
        })
        .done(function(data) {
            alert("success");
        })
        .fail(function() {
            alert("error");
        });
    });
