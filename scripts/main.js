Events.on(ClientLoadEvent, function(e) {
    const scope = Vars.mods.getScripts().scope;
    const states = { god: false, fly: false, shield: false, creative: false, editor: false, instant: false };

    const cmdList = {
        god: { desc: "Бессмертие", act: function() { 
            const u = Vars.player.unit(); if(!u) return "Ошибка: нет юнита"; 
            states.god = !states.god; u.health = states.god ? 999999 : u.maxHealth; 
            return "God Mode: " + (states.god ? "ВКЛ" : "ВЫКЛ"); 
        }},
        heal: { desc: "Починить здания", act: function() { 
            Groups.build.each(function(b) { if(b.team == Vars.player.team()) b.health = b.maxHealth; }); 
            return "Здания починены"; 
        }},
        spawn: { desc: "Спавн 5 юнитов", act: function() { 
            const u = Vars.player.unit(); if(!u) return "Ошибка: нет юнита"; 
            for(let i=0; i<5; i++) u.type.spawn(Vars.player.team(), u.x, u.y); 
            return "Юниты созданы"; 
        }},
        win: { desc: "Победа", act: function() { 
            // Правильный способ победы в секторе
            Vars.logic.runGameOver(Vars.player.team()); 
            return "Победа активирована!"; 
        }},
        wave: { desc: "След. волна", act: function() { Vars.logic.skipWave(); return "Волна пропущена"; }},
        help: { desc: "Список команд", act: function() { 
            Log.info("\n[#00ffff]=== Доступные команды ===[]");
            for (let name in cmdList) Log.info("[#ffff00]" + name + "[] — " + cmdList[name].desc);
            return "Список выведен."; 
        }}
    };

    // Регистрация
    for (let name in cmdList) {
        (function(n) {
            Object.defineProperty(scope, n, { get: function() {
                let res = cmdList[n].act();
                Log.info("[#00ff00]UltraScript: " + res + "[]");
                return "";
            }, configurable: true });
        })(name);
    }
});

// ПРАВИЛЬНЫЙ ВЫВОД ПРИ ВХОДЕ В СЕКТОР
Events.on(WorldLoadEvent, function(e) {
    // Небольшая задержка, чтобы игра успела прогрузить интерфейс
    Time.run(60, function() {
        Log.info("\n[#00ff00]=== UltraScript Активирован ===[]");
        Log.info("[#ffff00]Сектор загружен. Введи 'help' для справки.[]");
    });
});
