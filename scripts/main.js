Events.on(ClientLoadEvent, function(e) {
    function loadCommands() {
        var isNet = Vars.net.active();
        var scope = Vars.mods.getScripts().scope;
        scope.c = { states: {}, help: function() { return ""; } };
        var c = scope.c;

        c.toggle = function(name, on, off) {
            this.states[name] = !this.states[name];
            this.states[name] ? on() : off();
            Log.info(">>> " + name + " : " + (this.states[name] ? "ВКЛ" : "ВЫКЛ"));
        };

        c.god = { get: function() { c.toggle('god', function() { if(Vars.player.unit()) Vars.player.unit().health = 999999; }, function() { if(Vars.player.unit()) Vars.player.unit().health = Vars.player.unit().maxHealth; }); } };
        c.speed = { get: function() { c.toggle('speed', function() { if(Vars.player.unit()) Vars.player.unit().type.speed *= 5; }, function() { if(Vars.player.unit()) Vars.player.unit().type.speed /= 5; }); } };
        c.fly = { get: function() { c.toggle('fly', function() { if(Vars.player.unit()) { Vars.player.unit().type.flying = true; Vars.player.unit().type.canClip = !isNet; } }, function() { if(Vars.player.unit()) { Vars.player.unit().type.flying = Vars.player.unit().type.defaultController === null; Vars.player.unit().type.canClip = false; } }); } };
        c.shield = { get: function() { c.toggle('shield', function() { if(Vars.player.unit()) Vars.player.unit().shield = 9999; }, function() { if(Vars.player.unit()) Vars.player.unit().shield = 0; }); } };
        c.heal = { get: function() { Groups.build.each(function(b) { if (b.team == Vars.player.team()) b.health = b.maxHealth; }); return ">>> База исцелена"; } };
        c.ammo = { get: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team() && b instanceof Turret.TurretBuild) { b.ammo.clear(); Vars.content.items().each(function(i) { if(b.type.ammoTypes.containsKey(i)) b.ammo.add(i, 999); }); } }); return ">>> Турели заряжены"; } };
        c.fill = { get: function() { var core = Vars.player.unit().core(); if(core) { Vars.content.items().each(function(i) { if(isNet ? true : i.unlockedNow()) core.items.add(i, isNet ? 1000 : core.storageCapacity); }); return ">>> Ядро пополнено"; } } };
        
        c.off = { get: function() {
            for(var key in c.states) c.states[key] = false;
            if(Vars.player.unit()) { Vars.player.unit().shield = 0; Vars.player.unit().type.flying = false; Vars.player.unit().type.canClip = false; Vars.player.unit().health = Vars.player.unit().maxHealth; }
            return ">>> СБРОС";
        }};

        if (!isNet) {
            c.creative = { get: function() { c.toggle('creative', function() { Vars.state.rules.infiniteResources = true; Vars.state.rules.modeName = "sandbox"; }, function() { Vars.state.rules.infiniteResources = false; Vars.state.rules.modeName = "survival"; }); } };
            c.editor = { get: function() { c.toggle('editor', function() { Vars.state.rules.editor = true; }, function() { Vars.state.rules.editor = false; }); } };
            c.instant = { get: function() { c.toggle('instant', function() { Vars.state.rules.buildSpeedMultiplier = 9999; }, function() { Vars.state.rules.buildSpeedMultiplier = 1; }); } };
            c.immortal = { get: function() { c.toggle('immortal', function() { Vars.state.rules.blockHealthMultiplier = 99999; }, function() { Vars.state.rules.blockHealthMultiplier = 1; }); } };
            c.fog = { get: function() { c.toggle('fog', function() { Vars.state.rules.fog = false; }, function() { Vars.state.rules.fog = true; }); } };
            c.boost = { get: function() { c.toggle('boost', function() { Vars.state.rules.productionSpeedMultiplier = 100; }, function() { Vars.state.rules.productionSpeedMultiplier = 1; }); } };
            c.time = { get: function() { c.toggle('time', function() { Time.setDeltaProvider(function() { return Core.graphics.getDeltaTime() * 60 * 3; }); }, function() { Time.setDeltaProvider(null); }); } };
            c.wave = { get: function() { Vars.logic.skipWave(); return ">>> Волна пропущена"; } };
            c.kill = { get: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return ">>> Враги уничтожены"; } };
            c.wreck = { get: function() { Groups.build.each(function(b) { if (b.team != Vars.player.team()) b.kill(); }); return ">>> Здания уничтожены"; } };
            c.dump = { get: function() { var core = Vars.player.unit().core(); if(core) { core.items.clear(); return ">>> Ядро очищено"; } } };
            c.spawn = { get: function() { for(var i=0; i<5; i++) { var u = Vars.player.unit().type.create(Vars.player.team()); u.set(Vars.player.x, Vars.player.y); u.add(); } return ">>> 5 юнитов создано"; } };
            c.win = { get: function() { Events.fire(new SectorCaptureEvent(Vars.state.getSector())); return ">>> ПОБЕДА"; } };
            c.lose = { get: function() { var core = Vars.player.unit().core(); if(core) core.kill(); return ">>> ПОТЕРЯ СЕКТОРА"; } };
            c.research = { get: function() { Vars.content.each(function(content) { if (content instanceof UnlockableContent) content.quietUnlock(); }); return ">>> Все открыто"; } };
            c.team = { get: function() { var u = Vars.player.unit(); if(u) { u.team(u.team() == Team.sharded ? Team.crux : Team.sharded); return ">>> Команда изменена"; } } };
        }

        Object.keys(c).forEach(function(key) { if (c[key] && c[key].get) Object.defineProperty(c, key, c[key]); });
    }

    Events.on(WorldLoadEvent, loadCommands);
    loadCommands();
    Log.info("Ultra Script Ready!");
});
                                                    
