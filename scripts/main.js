Events.on(ClientLoadEvent, function(e) {
    var scope = Vars.mods.getScripts().scope;

    function register() {
        var isNet = Vars.net.active();
        
        var commands = {
            god: function() { 
                var u = Vars.player.unit(); 
                if(u) u.health = (u.health >= 999999 ? u.maxHealth : 999999);
                return ">>> God: " + (u && u.health == 999999 ? "ON" : "OFF");
            },
            fly: function() { 
                var u = Vars.player.unit();
                if(u) {
                    u.type.flying = !u.type.flying;
                    if(!isNet) u.type.canClip = u.type.flying;
                }
                return ">>> Fly: " + (u && u.type.flying ? "ON" : "OFF");
            },
            heal: function() {
                Groups.build.each(function(b) { if(b.team == Vars.player.team()) b.health = b.maxHealth; });
                return ">>> Healed";
            },
            ammo: function() {
                Groups.build.each(function(b) { 
                    if(b.team == Vars.player.team() && b instanceof Turret.TurretBuild) { 
                        b.ammo.clear(); 
                        Vars.content.items().each(function(i) { if(b.type.ammoTypes.containsKey(i)) b.ammo.add(i, 999); }); 
                    } 
                });
                return ">>> Ammo full";
            }
        };

        if (!isNet) {
            commands.wave = function() { Vars.logic.skipWave(); return ">>> Wave skipped"; };
            commands.kill = function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.kill(); }); return ">>> Enemies killed"; };
        }

        Object.keys(commands).forEach(function(n) { scope[n] = commands[n]; });
    }

    Events.on(WorldLoadEvent, register);
    register();
});
