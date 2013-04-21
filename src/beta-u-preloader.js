u.preloader = function(node, files, options) {

	var callback, callback_min_delay

	// additional info passed to function as JSON object
	if(typeof(options) == "object") {
		var argument;
		for(argument in options) {

			switch(argument) {
				case "callback"				: callback				= options[argument]; break;
				case "callback_min_delay"	: callback_min_delay	= options[argument]; break;
			}

		}
	}



	if(!u._preloader_queue) {
		u._preloader_queue = document.createElement("div");
//		u._preloader_queue = u.ae(document.body, "div");
		u._preloader_processes = 0;
	}

	if(node && files) {

		var entry, file;
		var new_queue = u.ae(u._preloader_queue, "ul");
		new_queue._callback = callback;
		new_queue._node = node;
		new_queue._files = files;
		new_queue.nodes = new Array();
		new_queue._start_time = new Date().getTime();

		for(i = 0; file = files[i]; i++) {
			entry = u.ae(new_queue, "li", {"class":"waiting"});
			entry.i = i;
			entry._queue = new_queue
			entry._file = file;
		}

		// add waiting class on reuest node
		u.ac(node, "waiting");
		// callback to request node (in queue)
		if(typeof(node.waiting) == "function") {
			node.waiting();
		}
	}

	u.queueLoader();

	return u._preloader_queue;
}

u.queueLoader = function() {

//	u.bug("queueLoader:" + u.preload_processes);

	// still items in queue
//	u.bug("li.waiting:" + u.qs("li.waiting", u._preloader_queue))
	if(u.qs("li.waiting", u._preloader_queue)) {

		while(u._preloader_processes < 4) {

			var next = u.qs("li.waiting", u._preloader_queue);
			if(next) {

				// it this the fist node of queue? (does node still have waiting position
				if(u.hc(next._queue._node, "waiting")) {
					// adjust classes on request node
					u.rc(next._queue._node, "waiting");
					u.ac(next._queue._node, "loading");
					// callback - loading has begun
					if(typeof(next._queue._node.loading) == "function") {
						next._node._queue.loading();
					}

				}
				u._preloader_processes++;

//				u.bug("next:" + u.qs("li.waiting", u._preloader_queue) + ", " + next)
				u.rc(next, "waiting");
				u.ac(next, "loading");


				next.loaded = function(event) {
					this._image = event.target;
					// this._image = {};
					// this._image.width = event.target.width;
					// this._image.height = event.target.height;
					// this._image.src = event.target.src;

					this._queue.nodes[this.i] = this;

//					u.as(this, "backgroundImage", "url("+event.target.src+")");
//					u.bug("loaded and used")

					u.rc(this, "loading");
					u.ac(this, "loaded");

					u._preloader_processes--;

					if(!u.qs("li.waiting,li.loading", this._queue)) {

						// remove loading class from request node
						u.rc(this._queue._node, "loading");
						// callback to specific callback function
						if(typeof(this._queue._callback) == "function") {
							this._queue._node._callback = this._queue._callback;
							this._queue._node._callback(this._queue.nodes);
						}
						// or callback to default (loaded)
						else if(typeof(this._queue._node.loaded) == "function") {
							this._queue._node.loaded(this._queue.nodes);
						}
					}

					u.queueLoader();
				}
				u.i.load(next, next._file);
			}
			else {
				break
			}
		}

	}


}