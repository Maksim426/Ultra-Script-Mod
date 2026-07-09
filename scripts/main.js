Events.on(ClientLoadEvent, function(e) {
    var scope = Vars.mods.getScripts().scope;
    var states = {};

    var cmdList = {
        god: { desc: "Бессмертие", act: function() { states.god = !states.god; var u = Vars.player.unit(); if(u) u.health = states.god ? 999999 : u.maxHealth; return "God: " + (states.god ? "ВКЛ" : "ВЫКЛ"); }},
        fly: { desc: "Полет", act: function() { states.fly = !states.fly; var u = Vars.player.unit(); if(u) { u.type.flying = states.fly; u.type.canClip = states.fly; } return "Fly: " + (states.fly ? "ВКЛ" : "ВЫКЛ"); }},
        shield: { desc: "Создать щит", act: function() { states.shield = !states.shield; var u = Vars.player.unit(); if(u) u.shield = states.shield ? 9999 : 0; return "Shield: " + (states.shield ? "ВКЛ" : "ВЫКЛ"); }},
        heal: { desc: "Починить все здания", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team()) b.health = b.maxHealth; }); return "Здания починены"; }},
        unwreck: { desc: "Восстановить разрушенное", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team() && b.health <= 0) b.heal(); }); return "Восстановлено"; }},
        ammo: { desc: "Зарядить все турели", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team() && b instanceof Turret.TurretBuild) { b.ammo.clear(); Vars.content.items().each(function(i) { if(b.type.ammoTypes.containsKey(i)) b.ammo.add(i, 999); }); } }); return "Турели заряжены"; }},
        fill: { desc: "Наполнить ядро ресурсами", act: function() { var c = Vars.player.unit().core(); if(!c) return "Ядро не найдено"; var p = Vars.state.rules.sector.planet; Vars.content.items().each(function(i) { if(i.unlockedNow() && (i.planet == p || i.flammability > 0 || i.hardness >= 0)) c.items.set(i, c.storageCapacity); }); return "Ядро заполнено: " + p.localizedName; }},
        speed: { desc: "Ускорить бег", act: function() { states.sp = !states.sp; var u = Vars.player.unit(); if(u) u.type.speed = states.sp ? 5 : 1; return "Speed: " + (states.sp ? "x5" : "x1"); }},
        boom: { desc: "Взрыв на месте юнита", act: function() { var u = Vars.player.unit(); if(u) { Damage.dynamicExplosion(u.x, u.y, 100, 100, true, true); } return "Взрыв!"; }},
        wave: { desc: "Пропустить волну", act: function() { Vars.logic.skipWave(); return "Волна пропущена"; }},
        kill: { desc: "Убить врагов", act: function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.kill(); }); return "Враги уничтожены"; }},
        wreck: { desc: "Удалить вражеские здания", act: function() { Groups.build.each(function(b) { if(b.team != Vars.player.team()) b.kill(); }); return "Здания разрушены"; }},
        neutral: { desc: "Нейтрализовать врагов", act: function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.team(Team.derelict); }); return "Враги нейтральны"; }},
        dump: { desc: "Очистить ядро", act: function() { var c = Vars.player.unit().core(); if(c) c.items.clear(); return "Ядро очищено"; }},
        spawn: { desc: "Создать 5 юнитов", act: function() { for(var i=0; i<5; i++) { var u = Vars.player.unit().type.create(Vars.player.team()); u.set(Vars.player.x, Vars.player.y); u.add(); } return "Юниты созданы"; }},
        win: { desc: "Победа", act: function() { Events.fire(new SectorCaptureEvent(Vars.state.getSector())); return "Победа!"; }},
        lose: { desc: "Сброс волн", act: function() { Vars.state.wave = 1; Vars.logic.reset(); return "Сектор сброшен"; }},
        research: { desc: "Открыть технологии", act: function() { Vars.content.each(function(c) { if(c instanceof UnlockableContent) c.quietUnlock(); }); return "Все технологии открыты"; }}
    };

    var printHelp = function() {
        Log.info("\n[#00ff00]=== UltraScript: Рабочие команды ===[]");
        for (var name in cmdList) Log.info("[#ffff00]" + name + "[] - " + cmdList[name].desc);
        Log.info("[#00ff00]====================================[]\n");
    };

    for (var name in cmdList) {
        (function(n) {
            Object.defineProperty(scope, n, { get: function() {
                var res = cmdList[n].act();
                Log.info("[#00ffff]>> " + res + "[]");
                return "";
            }});
        })(name);
    }

    Object.defineProperty(scope, "help", { get: function() { printHelp(); return ""; }});

    Events.on(WorldLoadEvent, function() { printHelp(); });
});
            
