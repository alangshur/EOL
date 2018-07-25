# Front-End Structure:

# Temp Notes:

Communication between Popper and Kuhn, or between Backbone and Express, will only occur under three separate events:
  1. An HTML page (not an Underscore/Backbone template) needs to be loaded
  2. Backbone writes to Mongo
  3. Backbone reads from Mongo
  
How will each of these be carried out?
  1. An Express GET for page URL will load the HTML file from the back-end (no rendering)
  2. When a Backbone event is called, jQuery will trigger the HTML input with a URL connecting to an Express POST (this Backbone event should subsequently carry out 3. to update a model/the collection) (override Backbone.sync?)
  3. Front-end will load a URL (with database query parameters) through an ajax or fetch request which an Express GET will recieve, attaching the query result to a response JSON, which Backbone will receive (override Backbone.sync?)