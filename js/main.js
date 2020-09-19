(function() {
    "use strict";

    let all = [];
    let allPoints = [];
    let allArrows = [];
    let stepX = 65;
    let stepY = 0;

    let nextBtn = document.getElementById("btnNext");
    let doneBtn = document.getElementById("btnDone");
    let addNextBtn = document.getElementById("btnAddNext");
    let addDoneBtn = document.getElementById("btnAddDone");
    let clearAddBtn = document.getElementById("btnClearAdd");
    let btnAddtextarea = document.getElementById("btnAddtextarea");

    let storage = window.localStorage;
    storage.clear();

    function createCanvas() {
        let canvasDiv = document.createElement("div");
        let body = document.getElementsByTagName("body")[0];

        canvasDiv.id = "container";
        body.innerHTML = "";
        body.appendChild(canvasDiv);
    }

    function getColor(isliked){
        //value from 0 to 1
        // var hue=((1-value)*120).toString(10);
        // return ["hsl(",hue,",100%,50%)"].join("");
        let colors = [
            "red",
            "cyan",
            "orange",
            "yellow",
            "green",

        ]
        let result;
        // console.log(likes);
        console.log(isliked);

        result = colors[isliked];


        return result;
    }

    function adjustPoint(stage) {

        let arrows = stage.find("Arrow");

        for (var i = 0; i < arrows.length; i++) {
            let points = arrows[i].getId().slice(7).split("#");
            let from = points[0];
            let to = points[1];

            var p = [stage.findOne(`#group-${from}`).getX() + stepX, stage.findOne(`#group-${from}`).getY() + stepY, stage.findOne(`#group-${to}`).getX() + stepX, stage.findOne(`#group-${to}`).getY() + stepY];
            arrows[i].setPoints(p);
        }
    }


    function draw(data) {
        var width = window.innerWidth;
        var height = window.innerHeight;

        let posx = 20;
        let posy = 60;
        let step = 20;


        var stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height
        });

        var layer = new Konva.Layer();

        for (let i = 0; i < data.length; i++) {
            var group = new Konva.Group({
                x: Math.random() * stage.width(),
                y: Math.random() * stage.height(),

                width: 130,
                height: 25,
                rotation: 0,
                draggable: true,
                id: `group-${data[i].name}`
            });
            var rect = new Konva.Rect({
                width: 150,
                height: 50,
                fill: getColor(data[i].isLiked),
                stroke: 'black',
                strokeWidth: 2
            });
            group.add(rect);

            var tempText = `${data[i].name}
(${data[i].isLiked})`;

            if (data[i].likes.length === 0) {
                tempText = `${tempText} *`
            }

            var text = new Konva.Text({
                text: tempText,
                fontSize: 18,
                fontFamily: 'Calibri',
                fill: '#000',
                width: 150,
                padding: 5,
                align: 'center'
            })

            group.add(text);

            group.on('dragmove', function(event) {
                adjustPoint(stage);
            });

            layer.add(group);
            stage.add(layer);
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i].likes.length > 0) {
                for (let j = 0; j < data[i].likes.length; j++) {

                    if (stage.findOne(`#group-${data[i].name}`) && stage.findOne(`#group-${data[i].likes[j]}`)) {

                        var arrow = new Konva.Arrow({
                            points: [stage.findOne(`#group-${data[i].name}`).getX()+stepX, stage.findOne(`#group-${data[i].name}`).getY() + stepY, stage.findOne(`#group-${data[i].likes[j]}`).getX()+stepX, stage.findOne(`#group-${data[i].likes[j]}`).getY()+stepY],
                            pointerLength: 5,
                            pointerWidth: 5,
                            fill: 'black',
                            stroke: 'black',
                            strokeWidth: 1,
                            id: `#arrow-${data[i].name}#${data[i].likes[j]}`
                        });
                        allArrows.push([data[i].name, data[i].likes[j]])
                        layer.add(arrow);
                        layer.draw();
                    }
                }
            }
        }
    }

    function fixMissing(data2, data) {
        let p = JSON.parse(data["participants"]);

        for (let i = 0; i < p.length; i++) {
            if (!data.hasOwnProperty(p[i].toLowerCase())) {
                data2.push({
                    "name": p[i].toLowerCase(),
                    "likes": [],
                    "isLiked": 0
                })
            }
        }

        return data2
    }



    function generateData() {
        let data = {...storage};
        let data2= [];
        storage.clear();

        for (const key of Object.keys(data)) {
            if (!data2.hasOwnProperty(key) && key !== "participants") {
                data2.push({
                    "name": key,
                    "likes": JSON.parse(data[key]),
                    "isLiked": 0
                })
            }
        }

        let data3 = fixMissing(data2, data);


        for (let i = 0; i < data3.length; i++) {
            let allLikes = data3[i].likes;

            for (let j = 0; j < allLikes.length; j++) {
                let uniqueLike = allLikes[j];
                let index = data3.findIndex(x => x.name === uniqueLike);

                if (index > -1) {
                    data3[index].isLiked++;
                }
            }
        }

        return data3;

    }

    function sortData(data) {
        return data.sort((a, b) => (a.isLiked < b.isLiked) ? 1 : -1);
    }

    function updateParticipants() {
        let all = JSON.parse(storage.getItem("participants"));
        let participants = document.getElementById("participants");

        participants.innerHTML = "";

        for (var i = 0; i < all.length; i++) {
            if (storage.getItem(all[i].toLowerCase()) !== null) {
                participants.innerHTML += `<span class="green">${i+1}: ${all[i]}&nbsp;(ok)</span><br>`;
                let temp = document.getElementById("name").options[i].text;
                document.getElementById("name").options[i].text = `${temp} (ok)`;
                if (i+1 === all.length) {
                    document.getElementById("btnNext").remove();
                } else {

                    document.getElementById("name").options[i+1].selected = "true";
                }
            } else {
                participants.innerHTML += `${i+1}: ${all[i]}<br>`;
            }


        }
    }

    nextBtn.addEventListener("click", function(event) {
        let all = JSON.parse(storage.getItem("participants"));

        let name = document.getElementById("name").value;
        let l1 = document.getElementById("like1").value;
        let l2 = document.getElementById("like2").value;
        let l3 = document.getElementById("like3").value;
        let activeLs = []
        let data = []

        if (l1 != "") activeLs.push(l1)
        if (l2 != "") activeLs.push(l2)
        if (l3 != "") activeLs.push(l3)

        for (let i = 0; i < activeLs.length; i++) {
            if (activeLs[i] <= all.length) {
                data.push(all[activeLs[i]-1].toLowerCase())
            }
        }
        storage.setItem(name.toLowerCase(), JSON.stringify(data));

        document.getElementById("name").value = "";
        document.getElementById("like1").value = "";
        document.getElementById("like2").value = "";
        document.getElementById("like3").value = "";
        updateParticipants();

    });

    function addTheRest(sorted, data) {
        let participants = data["participants"];

        for (var i = 0; i < participants.length; i++) {
            if (!sorted.hasOwnProperty(participants[i].toLowerCase())) {
                sorted.push({
                    "name": participants[i],
                    "likes": [],
                    "isLiked": 0
                })
            }
        }
    }

    doneBtn.addEventListener("click", function(event) {
        let data = generateData();
        let sorted = sortData(data);

        createCanvas();
        draw(sorted);

    });

    addNextBtn.addEventListener("click", function(event) {
        let addName = document.getElementById("addname").value;
        if (addName != "") {
            let all = JSON.parse(storage.getItem("participants")) || [];
            let participants = document.getElementById("participants");
            if (all.indexOf(addName) === -1) {
                all.push(addName);
                storage.setItem("participants", JSON.stringify(all));
                participants.innerHTML = "";
                var sel = document.getElementById('name');
                var opt = document.createElement('option');
                opt.appendChild( document.createTextNode(addName) );
                opt.value = addName;
                sel.appendChild(opt);

                for (let i = 0; i < all.length; i++){
                    participants.innerHTML += `${i+1}: ${all[i]}<br>`;
                }

                document.getElementById("addname").value = "";
            } else {
                alert("Namnet: " + addName + " finns redan.");
            }
        }

    });

    clearAddBtn.addEventListener("click", function() {
        document.getElementById("addname").value="";
        participants.innerHTML = "";
        document.getElementById('name').innerHTML = "";

        storage.clear();
    });

    function fixFromTextarea(filtered) {
        let all = JSON.parse(storage.getItem("participants")) || [];
        let participants = document.getElementById("participants");
        var sel = document.getElementById('name');
        for (var i = 0; i < filtered.length; i++) {
            all.push(filtered[i]);
            var opt = document.createElement('option');
            opt.appendChild( document.createTextNode(filtered[i]));
            opt.value = filtered[i];
            sel.appendChild(opt);

        }
        participants.innerHTML = "";
        for (let i = 0; i < all.length; i++){
            participants.innerHTML += `${i+1}: ${all[i]}<br>`;
        }
        storage.setItem("participants", JSON.stringify(all));

            document.getElementById("addText").value = "";

    }

    btnAddtextarea.addEventListener("click", function(event) {
        let text = document.getElementById("addText").value;
        let filtered;
        if (text !== "") {
            text = text.split("\n");
            filtered = text.filter(function(val) {
                return val != "";
            });

        } else {
            alert("Ingenting i rutan...")
        }
        if (new Set(filtered).size !== filtered.length) {
            alert("Två namn är likadana...");
        } else {
            fixFromTextarea(filtered);
        }
    });
})();
