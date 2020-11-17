let resourcesRoot = './icons/'

let store = new Vue ({
    data: {
        content: [],
        teamMembers: [],
        tasks: []
    },
    created() {
        let collectionsToRetrieve = ['content', 'teamMembers', 'tasks']
        let requestUrl = '/get-data';
        for (collection of collectionsToRetrieve) {
            getData(collection)
        }

        function getData(collection) {
            fetch(requestUrl+'?collection='+collection)
                .then(function(response) {
                    return response.json()})
                .then(function(data) {
                    store[data.collection] = data.result
                })
        }
    }
});

let taskSection = Vue.component('taskSection', {
    props: ['title', 'state'],
    template: 
    `<section :id='state' class='task-section' v-on:drop='drop($event, state)' v-on:dragover.prevent v-on:dragenter.prevent>
        <div class='task-header' :id='state+"-header"'>
            <h2 class='task-header-text' :id='state+"-header-text"'>{{title}}</h2>
            <span class='number-of-tasks'>{{tasksByState(state).length}}</span>
        </div>
        <article v-bind:id='task.id' class='task' draggable v-on:dragstart='drag($event)' v-for='task in tasksByState(state)'>
            <span class='task-description'>{{task.description}}</span>
            <img class='task-member-icon' :src='getMemberInfo(task.ownerId).img' v-on:click='changeTaskOwner(task)' :title="getMemberInfo(task.ownerId).name">
            <i class='delete-task-btn fa fa-times' aria-hidden='true' v-on:click='removeTask(task)'></i>
        </article>
        <i class='add-task-btn fa fa-plus-circle' v-on:click='createNewTask(state)'></i>
    </section>`,
    data: function() {
        return {
            store: store
        }
    },
    methods: {
        tasksByState: function (stateName) {
            return store.tasks.filter(task => task.state === stateName);
        },
        createNewTask(state) {
            let newId = this.store.tasks.length +1;
            let randomNum = Math.floor(Math.random() * Math.floor(store.teamMembers.length)) + 1;
            store.tasks.push({_id: newId, description: 'empty task description', state: state, ownerId: randomNum})
        },
        removeTask(taskToRemove) {
            let index = store.tasks.indexOf(taskToRemove);
            store.tasks.splice(index, 1)
        },
        changeTaskOwner(task) {
            for (member of store.teamMembers) {
                if (member._id === task.ownerId) {
                    let newOwner = task.ownerId%store.teamMembers.length;
                    task.ownerId = newOwner+1;
                    break;
                }
            }
        },
        drag(ev) {
            ev.dataTransfer.dropEffect = 'move';
            ev.dataTransfer.effectAllowed = 'move';
            ev.dataTransfer.setData("id", ev.target.id);
        },
        drop(ev, state) {
            let id = ev.dataTransfer.getData("id");
            let item = store.tasks.find(item => item.id == id);
            item.state = state;
        },
        getMemberInfo(teamMemberId) {
            let profile = store.teamMembers.find(member => member._id == teamMemberId);
            return {img: resourcesRoot + profile.imgSrc, name: profile.name};
        }
    }
});

let viewModel = new Vue({
    el: "#main",
    data: {
        store: store
    },
    methods: {
        addTeamMember() {
            store.teamMembers.push({name: '...', imgSrc: 'empty.png', numberOfTasks: 0})
        },
        getMemberTasks(teamMemberId) {
            let tasks = store.tasks.filter(task => task.ownerId == teamMemberId);
            return tasks;
        }
    }
});