
var TestArgString = "name=Ryan&number=27&state=CO";

function setupParams(paramString) {
  //change the url without reloading page...will break in older browsers and IE below v10
  //only for testing
  window.history.pushState(null, null, window.location.pathname + paramString);
}

function clearParams() {
  setupParams("");
}

describe("Arg", function(){

  beforeEach(function(){

    // clear out any caches
    Arg = ArgReset();

  });

  it("should know its version", function(){
    expect(Arg.version).toEqual("1");
  });

  it("namespace should be defined", function(){
    expect(Arg).toBeDefined();
  });

  it("should be able to get the URL parameter string", function(){

    setupParams("?" + TestArgString);
    expect(Arg.querystring()).toEqual(TestArgString);

    setupParams("?" + TestArgString + "#something=else");
    expect(Arg.querystring()).toEqual(TestArgString);

  });

  it("should be able to get the hash parameter string", function(){

    setupParams("?something=else#" + TestArgString);
    expect(Arg.hashstring()).toEqual(TestArgString);

    setupParams("#" + TestArgString);
    expect(Arg.hashstring()).toEqual(TestArgString);

    setupParams("?something=else#?" + TestArgString);
    expect(Arg.hashstring()).toEqual(TestArgString);

  });

  it("should be able to get the POJO from the querystring via query()", function(){

    setupParams("?" + TestArgString);
    var args = Arg.query();

    expect(args["name"]).toEqual("Ryan");
    expect(args["number"]).toEqual("27");
    expect(args["state"]).toEqual("CO");

    expect(Arg._query).toEqual(args);

    Arg._query = {
      "name": "Mat",
      "number": "30"
    };
    var args = Arg.query();

    expect(args["name"]).toEqual("Mat");
    expect(args["number"]).toEqual("30");


  });

  it("should be able to get the POJO from the querystring via hash()", function(){

    setupParams("#" + TestArgString);
    var args = Arg.hash();

    expect(args["name"]).toEqual("Ryan");
    expect(args["number"]).toEqual("27");
    expect(args["state"]).toEqual("CO");

    expect(Arg._hash).toEqual(args);

    Arg._hash = {
      "name": "Mat",
      "number": "30"
    };
    var args = Arg.hash();

    expect(args["name"]).toEqual("Mat");
    expect(args["number"]).toEqual("30");

  });

  it("should be able to get all parameters (from query and hash) via the all() method", function(){

    setupParams("?name=Mat&eggs=true#number=30&state=CO");
    var args = Arg.all();

    expect(args["name"]).toEqual("Mat");
    expect(args["number"]).toEqual("30");
    expect(args["eggs"]).toEqual("true");
    expect(args["state"]).toEqual("CO");

    expect(Arg._all).toEqual(args);

    Arg._all = {
      "name": "Mat",
      "number": "30"
    };
    var args = Arg.all();

    expect(args["name"]).toEqual("Mat");
    expect(args["number"]).toEqual("30");

  });

  it("should give you quick access via the get method", function(){

    setupParams("?something=else&egg=123#?number=26&sausage=true");

    // standard
    expect(Arg.get("something")).toEqual("else");
    expect(Arg.get("egg")).toEqual("123");
    expect(Arg.get("number")).toEqual("26");
    expect(Arg.get("sausage")).toEqual("true");

    // defaults
    expect(Arg.get("nothing", "123")).toEqual("123");

    // deep nesting
    ArgReset();
    setupParams("?address[0].city=Boulder&name=Mat&something[0].very.deep[0].name=Ryan#?address[0].state=CO&address[1].city=Salt+Lake+City&address[1].state=UT");

    expect(Arg.get("address[0]")["city"]).toEqual("Boulder");
    expect(Arg.get("address[0]")["state"]).toEqual("CO");
    expect(Arg.get("something[0].very.deep[0].name")).toEqual("Ryan");

  });

});

describe("Arg.url", function(){

  it("should build a whole URL", function(){
    expect(Arg.url("http://www.google.com/", {q: "hello"})).toEqual("http://www.google.com/?q=hello");
  });

  it("should support query and hash if the user is explicit", function(){
    expect(Arg.url("http://www.google.com/", {q: "hello"}, {h: "yes"})).toEqual("http://www.google.com/?q=hello#?h=yes");
  });

  it("should respect Arg.urlUseHash", function(){
    Arg.urlUseHash = true;
    expect(Arg.url("http://www.google.com/", {q: "hello"})).toEqual("http://www.google.com/#?q=hello");
  });

  it("should default to the current page if no path is given", function(){
    Arg.urlUseHash = false;
    expect(Arg.url({q: "hello"})).toEqual(location.pathname + "?q=hello");
  });

  it("should not put the ? or #? on if there are no params", function(){
    Arg.urlUseHash = false;
    expect(Arg.url("http://www.google.com/", {})).toEqual("http://www.google.com/");
  });

});

describe("Arg.merge", function(){

  it("should be able to merge data via the merge() method", function(){

    var a = {
      "one": 1,
      "override": false
    };
    var b = {
      "two": 2,
      "override": true
    };
    var c = {
      "three": 3
    };

    var all = Arg.merge(a, b, c);

    expect(all["one"]).toEqual(1);
    expect(all["two"]).toEqual(2);
    expect(all["three"]).toEqual(3);
    expect(all["override"]).toEqual(true);

  });

});

describe("Arg.parse", function(){

  it("should clean incoming strings", function(){

    var obj = Arg.parse("?" + TestArgString);
    expect(obj["name"]).toEqual("Ryan");
    expect(obj["number"]).toEqual("27");
    expect(obj["state"]).toEqual("CO");

    var obj = Arg.parse("#" + TestArgString);
    expect(obj["name"]).toEqual("Ryan");
    expect(obj["number"]).toEqual("27");
    expect(obj["state"]).toEqual("CO");

    var obj = Arg.parse("?#" + TestArgString);
    expect(obj["name"]).toEqual("Ryan");
    expect(obj["number"]).toEqual("27");
    expect(obj["state"]).toEqual("CO");

    var obj = Arg.parse("#?" + TestArgString);
    expect(obj["name"]).toEqual("Ryan");
    expect(obj["number"]).toEqual("27");
    expect(obj["state"]).toEqual("CO");

  });

  it("should be able to parse the string into a data object", function(){
    var obj = Arg.parse(TestArgString);
    expect(obj["name"]).toEqual("Ryan");
    expect(obj["number"]).toEqual("27");
    expect(obj["state"]).toEqual("CO");
  });

  it("should be able to build deep objects using dot notation", function(){

    var s = "address.city=Boulder&address.state=CO";
    var obj = Arg.parse(s);

    expect(obj.address.city).toEqual("Boulder");
    expect(obj.address.state).toEqual("CO");

  });

  it("should be able to build arrays using array notation", function(){

    var s = "address[0].city=Boulder&address[0].state=CO&address[1].city=Salt+Lake+City&address[1].state=UT";
    var obj = Arg.parse(s);

    if (expect(obj.address).toBeDefined()) {
      expect(obj.address.length).toEqual(2);
      expect(obj.address[0].city).toEqual("Boulder");
      expect(obj.address[0].state).toEqual("CO");
      expect(obj.address[1].city).toEqual("Salt Lake City");
      expect(obj.address[1].state).toEqual("UT");
    }

  });

  it("should be able to handle very complicated nestings", function(){

    var s = "address[0].city=Boulder&name=Mat&something[0].very.deep[0].name=Ryan&address[0].state=CO&address[1].city=Salt+Lake+City&address[1].state=UT";
    var obj = Arg.parse(s);

    expect(obj.name).toEqual("Mat");
    expect(obj.something[0].very.deep[0].name).toEqual("Ryan");
    if (expect(obj.address).toBeDefined()) {
      expect(obj.address.length).toEqual(2);
      expect(obj.address[0].city).toEqual("Boulder");
      expect(obj.address[0].state).toEqual("CO");
      expect(obj.address[1].city).toEqual("Salt Lake City");
      expect(obj.address[1].state).toEqual("UT");
    }

  });

});

describe("Arg.stringify", function(){

  it("should be able to turn an object into a URL string via stringify()", function(){

    var s = Arg.stringify({
      name: "Ryan",
      number: 27,
      state: "CO"
    });
    expect(s).toContain("name=Ryan");
    expect(s).toContain("number=27");
    expect(s).toContain("state=CO");

  });

  it("should encode nested objects", function(){

    var s = Arg.stringify({
      one: {
        two: 2
      }
    });
    expect(s).toContain("one.two=2");

  });

  it("should return strings untouched (but encoded)", function(){

    var s = Arg.stringify("Hello?");
    expect(s).toEqual("Hello%3F");

  });

  it("should know how to encode arrays", function(){

    var s = Arg.stringify({
      places: [
        {
          city: "London"
        }, {
          city: "Boulder"
        }
      ]
    });
    expect(decodeURIComponent(s)).toContain("places[0].city=London");
    expect(decodeURIComponent(s)).toContain("places[1].city=Boulder");

  });

});
