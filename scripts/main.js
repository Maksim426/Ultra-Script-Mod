Events.on(ClientLoadEvent, function(e) {
    var scope = Vars.mods.getScripts().scope;

    var cmdList = {
        god: { desc: "Бессмертие юнита", act: function() { var u = Vars.player.unit(); if(u) { u.health = 999999; u.maxHealth = 999999; } return "God Mode"; }},
        fly: { desc: "Полет", act: function() { var u = Vars.player.unit(); if(u) { u.type.flying = true; u.type.canOverdrive = true; } return "Режим полета"; }},
        shield: { desc: "Щит", act: function() { var u = Vars.player.unit(); if(u) u.shield = 9999; return "Щит активирован"; }},
        heal: { desc: "Починить все здания", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team()) b.health = b.maxHealth; }); return "Здания починены"; }},
        unwreck: { desc: "Восстановить блоки", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team()) b.heal(); }); return "Восстановление"; }},
        ammo: { desc: "Зарядить турели", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team() && b.ammo != null) b.ammo = 999; }); return "Турели заряжены"; }},
        fill: { desc: "Наполнить ядро", act: function() { var c = Vars.player.unit().core(); var p = Vars.state.rules.sector.planet; if(c) Vars.content.items().each(function(i) { if(i.unlockedNow() && (i.planet == p || i.flammability > 0 || i.hardness >= 0)) c.items.set(i, c.storageCapacity); }); return "Ядро заполнено"; }},
        speed: { desc: "Скорость x5", act: function() { var u = Vars.player.unit(); if(u) u.speedMultiplier = 5; return "Скорость x5"; }},
        creative: { desc: "Креатив", act: function() { Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources; return "Creative: " + Vars.state.rules.infiniteResources; }},
        editor: { desc: "Режим редактора", act: function() { Vars.state.rules.editor = !Vars.state.rules.editor; return "Editor: " + Vars.state.rules.editor; }},
        instant: { desc: "Мгновенная постройка", act: function() { Vars.state.rules.buildSpeedMultiplier = Vars.state.rules.buildSpeedMultiplier > 1 ? 1 : 999; return "Instant Build"; }},
        off: { desc: "Отключить читы", act: function() { Vars.state.rules.infiniteResources = false; Vars.state.rules.editor = false; Vars.state.rules.buildSpeedMultiplier = 1; return "Читы отключены"; }},
        wave: { desc: "Пропустить волну", act: function() { Vars.logic.skipWave(); return "Волна пропущена"; }},
        kill: { desc: "Убить врагов", act: function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.kill(); }); return "Враги уничтожены"; }},
        wreck: { desc: "Удалить вражеские здания", act: function() { Groups.build.each(function(b) { if(b.team != Vars.player.team()) b.kill(); }); return "Здания удалены"; }},
        neutral: { desc: "Нейтрализовать врагов", act: function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.team = Team.derelict; }); return "Враги нейтральны"; }},
        dump: { desc: "Очистить ядро", act: function() { var c = Vars.player.unit().core(); if(c) c.items.clear(); return "Ядро очищено"; }},
        spawn: { desc: "Создать юнитов", act: function() { for(var i=0; i<5; i++) { Vars.player.unit().type.spawn(Vars.player.team(), Vars.player.x, Vars.player.y); } return "5 юнитов создано"; }},
        win: { desc: "Победа", act: function() { Events.fire(new SectorCaptureEvent(Vars.state.rules.sector)); return "Победа!"; }},
        lose: { desc: "Сброс", act: function() { Vars.logic.reset(); return "Сектор сброшен"; }},
        research: { desc: "Открыть технологии", act: function() { Vars.content.each(function(c) { if(c.unlock != null) c.unlock(); }); return "Технологии открыты"; }}
    };

    for (var name in cmdList) {
        (function(n) {
            Object.defineProperty(scope, n, { get: function() {
                var res = cmdList[n].act();
                Log.info("[#00ffff]" + res + "[]");
                return "";
            }});
        })(name);
    }

    Object.defineProperty(scope, "help", { get: function() {
        Log.info("\n[#00ff00]=== UltraScript ===[]");
        for (var name in cmdList) Log.info("[#ffff00]" + name + "[] — " + cmdList[name].desc);
        return "";
    }});

    Events.on(WorldLoadEvent, function() { Log.info("[#00ff00]UltraScript активен.[]"); });
});
            
