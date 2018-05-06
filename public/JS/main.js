$(document).ready(function () {

    $('#pollListBody').on('click', '.js-viewCell', function () {
        let id = $(this).parent().data('id');
        getDataForSecondPage(id);
        showSecondPage();
    });

    $('#pollListBody').on('click', '.js-removeCell', function () {
        let id = $(this).parent().data('id');
        deletePoll(id);
    });

    $('#pollingDivWrapper').on('click', '.js-voteButton', function () {
        let id = $(this).data('id');
        submitVote(id);
    });

    $('#refreshTable').on('click', function () {
        refreshTable();
    });

    $('#pollingDivWrapper').on('click' , '.backButton', function () {
        showFirstPage();
        $('.poliingPageWrapper').remove();
    });

    $('#createPollButton').on('click', function () {
        validateForm();
    });

    refreshTable();
})

function showFirstPage() {
    $('.pollingPage').hide();
    $('.homePage').show();
}

function showSecondPage() {
    $('.homePage').hide();
    $('.pollingPage').show();
}

function validateForm() {
    let title = $('#titleInput').val();
    let options = $('#optionsTextarea').val();

    if (!title || !options){
        alert("Please enter title and options");
        return;
    }
        

    let votingObj = {
        "title": title,
        "contestants": options
    };

    createPoll(votingObj);
}

function createPoll(voteObj) {
    var promise = new Promise(function (resolve, reject) {

        $.ajax({
            method: 'POST',
            url: '/createpoll',
            data: voteObj,
            success: function (data) {
                resolve(data);
            },
            error: function (err) {
                reject(err);
            }
        })
    });

    promise.then(function (response) {
        console.log(response);
        $('#titleInput').val('');
        $('#optionsTextarea').val('');
        updatePollList(response.createdObject);
    }).catch(function (err) {
        console.log(err);
        alert('Something went wrong');
    });
}

function updatePollList(obj) {
    var template = $('#template_pollList').html();
    let view = {
        list: [obj]
    }
    Mustache.parse(template);   // optional, speeds up future uses
    var rendered = Mustache.render(template, view);
    $('#pollListBody').append(rendered);

}

function getDataForSecondPage(id) {

    var promise = new Promise(function (resolve, reject) {

        $.ajax({
            method: 'GET',
            url: '/getpoll/' + id,
            success: function (data) {
                resolve(data);
            },
            error: function (err) {
                reject(err);
            }
        })
    });

    promise.then(function (response) {
        console.log(response);
        goToSecondPage(response);
    }).catch(function (err) {
        console.log(err);
        alert('Something went wrong');
    });

    getDataForForGraph(id);

}

function goToSecondPage(data) {
    console.log(data);
    var template = $('#template_pollingDiv').html();
    Mustache.parse(template);   // optional, speeds up future uses
    var rendered = Mustache.render(template, data);
    $('#pollingDivWrapper').html(rendered);
}

function refreshTable() {
    var promise = new Promise(function (resolve, reject) {

        $.ajax({
            method: 'GET',
            url: '/getall/',
            success: function (data) {
                resolve(data);
            },
            error: function (err) {
                reject(err);
            }
        })
    });

    promise.then(function (response) {
        reDrawCompleteTable(response);
    }).catch(function (err) {
        console.log(err);
        alert('Something went wrong');
    });
}

function reDrawCompleteTable(res) {
    var template = $('#template_pollList').html();
    let view = {
        list: res
    }
    Mustache.parse(template);   // optional, speeds up future uses
    var rendered = Mustache.render(template, view);
    $('#pollListBody').html(rendered);
}

function deletePoll(id) {
    var promise = new Promise(function (resolve, reject) {

        $.ajax({
            method: 'DELETE',
            url: '/deletepoll/' + id,
            success: function (data) {
                resolve(id);
            },
            error: function (err) {
                reject(err);
            }
        })
    });

    promise.then(function (ID) {
        $('#pollListBody tr[data-id=' + ID + ']').remove();
    }).catch(function (err) {
        console.log(err);
        alert('Something went wrong');
    });
}

function submitVote(id) {

    let selectedValue = $('.pollingSelection').val();
    let ID = id;
    var promise = new Promise(function (resolve, reject) {

        $.ajax({
            method: 'PATCH',
            url: '/updatepoll/' + id,
            data: {
                "name": selectedValue
            },
            success: function (data) {
                resolve(ID);
            },
            error: function (err) {
                reject(err);
            }
        })
    });

    promise.then(function (ID) {

        getDataForForGraph(ID);
        //drawGraph();
    }).catch(function (err) {
        console.log(err);
        alert('Something went wrong');
    });
}

function getDataForForGraph(id) {

    var promise = new Promise(function (resolve, reject) {

        $.ajax({
            method: 'GET',
            url: '/getpoll/' + id,
            success: function (data) {
                resolve(data);
            },
            error: function (err) {
                reject(err);
            }
        })
    });

    promise.then(function (data) {
        var dataForGraph = dataModelForGraph(data);
        //getDataForForGraph(dataForGraph);
        drawGraph(dataForGraph);
    }).catch(function (err) {
        console.log(err);
        alert('Something went wrong');
    });
}

function dataModelForGraph(data) {

    let labels = [];
    let votes = [];

    for (let i = 0; i < data.contestants.length; i++) {
        labels.push(data.contestants[i].name);
        votes.push(data.contestants[i].votes);
    }

    return {
        "labels": labels,
        "votes": votes,
    }


}

function drawGraph(obj) {
    var canvas = document.getElementById("resultChart");
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: obj.labels,
            datasets: [{
                label: '# of Votes',
                data: obj.votes,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });


}