(function () {
    PIXI.utils._saidHello = true;

    World.init(IO, 30, true);
    World.appendStats();
    IO.connect(function () {
        IO.getServerState();
    });

})();