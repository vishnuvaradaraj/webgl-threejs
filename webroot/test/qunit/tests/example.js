test("one tautology", function() {
  ok(true);
});

module("simple tests");

test("increments", function() {
  var mike = 0;

  ok(mike++ === 0);
  ok(mike === 1);
});

test("increments (improved)", function() {
  var mike = 0;

  equal(mike++, 0);
  equal(mike, 1);
});


module("setUp/tearDown", {
  setup: function() {
    //console.log("Before");
  },

  teardown: function() {
    //console.log("After");
  }
});

test("example", function() {
  //console.log("During");
  equal(1, 1);
});

module("async");

test("just a test", function() {
	expect(1);
	ok(true);
});
