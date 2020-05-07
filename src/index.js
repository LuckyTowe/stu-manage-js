const sidebar = document.querySelector('.sidebar');
const submitBtn = document.querySelector('.submit');
const tableContent = document.getElementById('tbody-area');
const modal = document.getElementsByClassName('modal')[0];
const editSubmit = document.getElementById('editSubmit');
const prevPage = document.getElementsByClassName('prev-page')[0];
const nextPage = document.getElementsByClassName('next-page')[0];
const turnPage = document.getElementsByClassName('turn-page')[0];

let tableData = [];
let currentPage = 1;
let pageSize = 2;
let allPage = 1;

function bindEvent() {
    sidebar.addEventListener('click', function(e) {
        let tagName = e.target.tagName;
        let beforeActive = document.getElementsByClassName('dl-list active')[0];
        let beforeContentActive = document.getElementsByClassName('content-active')[0];
        let target = e.target.getAttribute('data-id');
        let block = document.getElementsByClassName(target)[0];
        if (tagName === 'DD') {
            changeActiveStyle(beforeActive, e.target, 'active')
                // beforeActive.classList.remove('active');
                // e.target.classList.add('active');

            changeActiveStyle(beforeContentActive, block, 'content-active')
                // beforeContentActive.classList.remove('content-active');
                // block.classList.add('content-active');
        }
    })
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        let resultData = format('.student-add form');
        if (resultData.msg) {
            alert(resultData.msg)
        } else {
            transferData('/api/student/addStudent', resultData.data, () => {
                alert('添加成功')
                const studentAddForm = document.querySelector('.student-add form');
                studentAddForm.reset();
                getStudentData();
            });
            // let response = saveData('http://open.duyiedu.com/api/student/addStudent', Object.assign({ appkey: 'WuTao_1583141476704' }, resultData.data))
            // if (response.status == 'success') {
            //     alert('添加成功')
            //     const studentAddForm = document.querySelector('.student-add form');
            //     studentAddForm.reset();
            //     getStudentData();
            // } else {
            //     alert(response.msg);
            // }
        }
    })

    modal.onclick = function(e) {
        if (e.target.className == 'mask') {
            modal.style.display = 'none'
        }
    };

    tableContent.addEventListener('click', function(e) {
        const tagName = e.target.tagName;
        const clickedIndex = e.target.getAttribute('data-id');
        if (tagName === 'BUTTON') {
            btnClasses = Array.from(e.target.classList)
            if (btnClasses.includes('edit')) {
                //跳出编辑表单弹窗
                modal.style.display = 'block';
                editTableFill(tableData[clickedIndex]);
            } else {
                transferData('/api/student/delBySno', { sNo: tableData[clickedIndex].sNo }, function() {
                    alert('删除成功');
                    getStudentData();
                });
                // const response = saveData('http://open.duyiedu.com/api/student/delBySno', Object.assign({ appkey: 'WuTao_1583141476704' }, { sNo: tableData[clickedIndex].sNo }))
                // if (response.status === 'success') {
                //     alert('删除成功');
                //     getStudentData();
                // } else {
                //     alert(response.msg);
                // }
            }
        }
    })

    //修改信息框提交事件
    editSubmit.onclick = function(e) {
        e.preventDefault();
        const resultData = format('.form-info');
        transferData('/api/student/updateStudent', resultData.data, function() {
            alert('修改成功');
            modal.style.display = 'none';
            getStudentData();
        });
        // const response = saveData('http://open.duyiedu.com/api/student/updateStudent', Object.assign({ appkey: 'WuTao_1583141476704' }, resultData.data))
        // if (response.status == 'success') {
        //     alert('修改成功');
        //     modal.style.display = 'none';
        //     getStudentData();
        // } else {
        //     alert(response.msg);
        // }

    }

    turnPage.addEventListener('click', function(e) {
        if (e.target.className === 'next-page') {
            currentPage++;
            getStudentData();
        } else {
            currentPage--;
            getStudentData();
        }
    })


}
bindEvent();
//传输数据请求
function transferData(url, data, successFunc) {
    const response = saveData(`http://open.duyiedu.com${url}`, Object.assign({ appkey: 'WuTao_1583141476704' }, data));
    if (response.status == 'success') {
        successFunc();
    } else {
        alert(response.msg);
    }

}
//切换侧边导航和内容区
function changeActiveStyle(beforeActiveDom, afterActiveDom, activeClassName) {
    beforeActiveDom.classList.remove(activeClassName);
    afterActiveDom.classList.add(activeClassName);
}
//修改学生信息回填
function editTableFill(data) {
    const editTable = document.getElementById('editTable');
    for (const prop in data) {
        if (editTable[prop]) {
            editTable[prop].value = data[prop];
        }
    }
}


//验证输入表单信息
function format(className) {
    let form = document.querySelector(className);
    let result = {
        data: {},
        msg: ''
    }
    let name = form.name.value;
    let sex = form.sex.value;
    let email = form.email.value;
    let sNo = form.sNo.value
    let birth = form.birth.value;
    let phone = form.phone.value;
    let address = form.address.value;
    if (name && sex && email && birth && phone && address && sNo) {
        result.data = {
            name,
            sex,
            birth,
            phone,
            address,
            email,
            sNo
        }
    } else {
        result.msg = '信息填写不完全！'
    }
    return result;
}

//获得学生列表最新数据并渲染
function getStudentData() {
    const response = saveData('http://open.duyiedu.com/api/student/findByPage', Object.assign({ appkey: 'Towe_1582352374649' }, {
        page: currentPage,
        size: pageSize
    }))
    console.log(response)
    tableData = response.data.findByPage;
    allPage = Math.ceil(response.data.cont / pageSize);
    console.log(allPage)
    render(tableData);
    renderPage();
}
//渲染分页器
function renderPage() {
    if (currentPage < allPage) {
        nextPage.style.display = 'inline-block'
    } else {
        nextPage.style.display = 'none'
    }
    if (currentPage > 1) {
        prevPage.style.display = 'inline-block'
    } else {
        prevPage.style.display = 'none'
    }
}
//渲染学生列表
function render(data) {
    const table = document.getElementsByClassName('tableContent')[0];
    let html = '';
    let realSex = {
        0: '男',
        1: '女'

    }
    let year = new Date().getFullYear()
    if (data.length == 0) {
        table.innerHTML = html
    } else {
        data.forEach((item, index) => {
            html += `
            <tr>
                <td>${item.sNo}</td>
                <td>${item.name}</td>
                <td>${realSex[item.sex]}</td>
                <td>${item.email}</td>
                <td>${year -item.birth}</td>
                <td>${item.phone}</td>
                <td>${item.address}</td>
                <td>
                    <button class="btn edit" data-id=${index}>编辑</button>
                    <button class="btn delete" data-id=${index}>删除</button>
                </td>
            </tr>`
            table.innerHTML = html
        })
    }



}
getStudentData();
//Ajax请求
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object') {
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}