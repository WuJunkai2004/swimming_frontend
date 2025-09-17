<script setup>
import { ref } from 'vue'

const form = ref({
    name: '',
    age: '',
    event: ''
})

const submitted = ref(false)

function submitForm() {
    // 这里可以添加实际的提交逻辑
    submitted.value = true
}
</script>

<template>
    <div class="register-view">
        <h1>比赛报名</h1>
        <form @submit.prevent="submitForm">
            <div>
                <label for="name">姓名：</label>
                <input id="name" v-model="form.name" required />
            </div>
            <div>
                <label for="age">年龄：</label>
                <input id="age" type="number" v-model="form.age" required min="1" />
            </div>
            <div>
                <label for="event">参赛项目：</label>
                <select id="event" v-model="form.event" required>
                    <option value="" disabled>请选择项目</option>
                    <option value="自由泳">自由泳</option>
                    <option value="蛙泳">蛙泳</option>
                    <option value="仰泳">仰泳</option>
                    <option value="蝶泳">蝶泳</option>
                </select>
            </div>
            <button type="submit">提交报名</button>
        </form>
        <div v-if="submitted" class="success-message">
            报名成功！
        </div>
    </div>
</template>

<style scoped>
.register-view {
    max-width: 400px;
    margin: 40px auto;
    padding: 24px;
    border: 1px solid #eee;
    border-radius: 8px;
    background: #fafcff;
}
form > div {
    margin-bottom: 16px;
}
label {
    display: inline-block;
    width: 80px;
}
input, select {
    width: 200px;
    padding: 4px;
}
button {
    padding: 8px 16px;
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
.success-message {
    margin-top: 20px;
    color: #388e3c;
}
</style>