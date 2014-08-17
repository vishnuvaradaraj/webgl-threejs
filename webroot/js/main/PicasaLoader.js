var PARABAY = PARABAY || {};

PARABAY.PicasaLoader = function(_user) {

    this.user = _user;
    this.db = null;
    this.access_token = 'ya29.AHES6ZT4PbaTWamjWudGPC-kVuDy0E836baEoalTJ4_HyRja';

};

PARABAY.PicasaLoader.prototype.init = function(_user) {


    try {
        if (window.openDatabase) {
            this.db = openDatabase("mytv", "1.0", "Parabay Inc - MyTV", 200000);
            if (this.db) {
                this.db.transaction(function(tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS content (id TEXT, url TEXT, height INTEGER, width INTEGER, title TEXT, description TEXT, groups TEXT, source TEXT, moreinfo TEXT, media TEXT, thumbnail TEXT, user TEXT, owner TEXT, created TEXT);");
                });
            } else {
                console.log('error occurred trying to open DB');
            }
        } else {
            console.log('Web Databases not supported');
        }
    } catch(e) {
        console.log('exception during open database');
    }
};

PARABAY.PicasaLoader.prototype.loadFromCache = function(callback) {
    this.db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM content WHERE owner = ? ORDER BY created DESC', [this.user],
        function(tx, results) {

            if (results.rows && results.rows.length) {
                for (i = 0; i < results.rows.length; i++) {
                    console.log(results.rows.item(i));
                }
            }
            
            if (callback) {
                callback(results);
            }
        },
        function(tx) {
            console.log('error occurred, please reset DB');
        });
    });

};

PARABAY.PicasaLoader.prototype.reset = function() {
    status.innerHTML = 'resetting database';

    this.db.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS content', [],
        function() {
            console.log('Deleted table.')
        });
    });
};


PARABAY.PicasaLoader.prototype.load = function() {

    var db = this.db;
    var user = this.user;
    var access_token = this.access_token;




    var url = "https://picasaweb.google.com/data/feed/api/user/:user_id?kind=photo&max-results=30&alt=jsonc&access_token=:access_token&callback=?";
    url = url.replace(/:user_id/, user).replace(/:access_token/, access_token);
    console.log(url);

    $.getJSON(url,
    function(data) {



        $.each(data.data.items,
        function(i, image) {
            console.log(image);

            var media = 'image';
            var mediaObj = null;
            var thumbnail = null;

            if (image.media && image.media.image) {
                mediaObj = image.media.image;
            }

            if (image.media && image.media.thumbnails && image.media.thumbnails[0]) {
                thumbnail = image.media.thumbnails[0];
            }

            if (mediaObj) {
                try {

                    db.transaction(function(tx) {

                        tx.executeSql('INSERT INTO content (id, url, height, width, title, description, groups, source, moreinfo, media, thumbnail, user, owner, created ) values (?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [image.id, mediaObj.url, mediaObj.height, mediaObj.width, image.title, image.description, image.album, 'Google', 'http://picasaweb.google.com', mediaObj.type, thumbnail, user, user, image.published]);
                    });

                } catch(e) {
                    console.log('exception during save database:' + e);
                }
            }
        });




    });
};


