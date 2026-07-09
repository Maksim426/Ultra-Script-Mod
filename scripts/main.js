Events.on(ClientLoadEvent, function(e) {
    var scope = Vars.mods.getScripts().scope;

    var cmdList = {
        god: { desc: "Бессмертие", act: function() { var u = Vars.player.unit(); if(u) { u.health = 999999; u.maxHealth = 999999; } return "God Mode активирован"; }},
        fly: { desc: "Полет", act: function() { var u = Vars.player.unit(); if(u) { u.abilities.clear(); } return "Полет активирован (эффекты сброшены)"; }},
        shield: { desc: "Щит", act: function() { var u = Vars.player.unit(); if(u) u.shield = 9999; return "Щит применен"; }},
        heal: { desc: "Починить все здания", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team()) b.health = b.maxHealth; }); return "Здания починены"; }},
        unwreck: { desc: "Восстановить блоки", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team()) b.heal(); }); return "Восстановление запущено"; }},
        ammo: { desc: "Зарядить турели", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team() && b.ammo != null) b.ammo = 999; }); return "Турели заряжены"; }},
        fill: { desc: "Наполнить ядро", act: function() { var c = Vars.player.unit().core(); if(c) Vars.content.items().each(function(i) { c.items.add(i, 999); }); return "Ядро наполнено"; }},
        speed: { desc: "Скорость x5", act: function() { var u = Vars.player.unit(); if(u) u.speedMultiplier = 5; return "Скорость ускорена"; }},
        wave: { desc: "Пропустить волну", act: function() { Vars.logic.skipWave(); return "Волна пропущена"; }},
        kill: { desc: "Убить врагов", act: function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.kill(); }); return "Враги уничтожены"; }},
        wreck: { desc: "Удалить вражеские здания", act: function() { Groups.build.each(function(b) { if(b.team != Vars.player.team()) b.kill(); }); return "Здания удалены"; }},
        neutral: { desc: "Нейтрализовать врагов", act: function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.team = Team.derelict; }); return "Враги теперь нейтральны"; }},
        dump: { desc: "Очистить ядро", act: function() { var c = Vars.player.unit().core(); if(c) c.items.clear(); return "Ядро пустое"; }},
        spawn: { desc: "Создать юнитов", act: function() { for(var i=0; i<5; i++) { var u = Vars.player.unit().type.spawn(Vars.player.team(), Vars.player.x, Vars.player.y); } return "5 юнитов создано"; }},
        win: { desc: "Мгновенная победа", act: function() { Vars.logic.runGameOver(Vars.player.team()); return "Победа!"; }},
        lose: { desc: "Сброс сектор", act: function() { Vars.logic.reset(); return "Сектор сброшен"; }},
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
        Log.info("\n[#00ff00]=== Команды UltraScript ===[]");
        for (var name in cmdList) Log.info("[#ffff00]" + name + "[] — " + cmdList[name].desc);
        return "";
    }});

    Events.on(WorldLoadEvent, function() { Log.info("[#00ff00]UltraScript готов. Введи help для списка.[]"); });
});
            
