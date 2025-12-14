function practice() {
    return {
        messages: [],
        numsen: 0,
        numcursen: 0,
        status: 'loading',
        statussen: 'loading',
        lessondata: [],
        lessonname: '',
        result: '',
        input: '',
        trangthai: false,
        normalizeString: function(str) {
            return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').trim();
        },
        init: function() {
            this.status = 'loading';
            fetch('data.json').then(rs => rs.json())
            .then(data => {
                this.lessondata = data;
                this.lessonname = this.lessondata.lessonname;
                this.numsen = this.lessondata.lessonsens.length;
                this.numcursen = 0;
                this.status = 'learning';
                this.loadsen();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                this.status = 'error';
            });
        },
        check: function() {
            this.trangthai = (this.normalizeString(this.input) == this.normalizeString(this.result));
            if(this.trangthai) {
                this.addChat(this.input, 'user', 'true');
            } else {
                this.addChat(this.input, 'user', 'false');
            }
            this.input='';
            if(this.trangthai){
                if(this.numcursen+1 == this.numsen) {
                    this.status='done';
                    this.numcursen=this.numsen;
                }
                else {
                    this.numcursen++;
                    this.loadsen();
                }
            };
        },
        loadsen: function() {
            question = this.lessondata.lessonsens[this.numcursen].question;
            target = this.lessondata.lessonsens[this.numcursen].target;
            question = question.replace(target,`<span class="text-target">${target}</span>`)
            console.log(target)
            console.log(question)
            this.result = this.lessondata.lessonsens[this.numcursen].result;
            this.addChat(question, 'bot');
        },
        addChat: function(output, user, type='ask') {
            if (user=='bot'){
                setTimeout(() => {
                    this.statussen = 'loading';
                    this.scrollChat();
                }, 0);
                setTimeout(() => {
                    this.statussen = 'done';
                    this.messages.push({
                        from: user,
                        text: output,
                        type: type
                    });
                    this.scrollChat();
                }, 0);
            } else {
                this.messages.push({
                    from: user,
                    text: output,
                    type: type
                });
                this.scrollChat();
            }

        },
        scrollChat: function() {
            const messagesContainer = document.getElementById('messages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            }, 100);
        },
    }
}