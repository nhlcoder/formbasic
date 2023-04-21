// Đối tượng validatetor
function Validator(options){

    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement, rule){
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // Lập qua từng rule & kiểm tra
        // Nếu có lỗi dừng việc kiểm tra
        for(var i = 0 ; i < rules.length ; ++i){
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        }
        if(errorMessage){
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        }else{
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }
        return !errorMessage;
    }
    
    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if(formElement){

        formElement.onsubmit = (e) => {
            e.preventDefault();

            var isFormValid = true;
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });
            if(isFormValid){
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        return (values[input.name] = input.value) && values;
                    }, {});
                    console.log(formValues);
                    options.onSubmit(formValues);
                // Trường hơp submit với hành động mặc định
                }else{
                    formElement.submit()
                }
            }
        }

        // Lặp qua mỗi rules và xử lý (lắng nghe sự kiện, blur, input, ...);
        options.rules.forEach((rule) => {

            // Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            var errorElement = inputElement.parentElement.querySelector('.form-message');
            if(inputElement){
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                }

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = () => {
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                };
            };
        });
        console.log(selectorRules);
    };
    
};

// Định nghĩa rules
// Nguyên tắc của các rules
// 1. Khi có lỗi => message lỗi
// 2. Khi không có lỗi => không trả undèfined
Validator.isRequired = (selector, error) => {
    return {
        selector: selector,
        test: function(value){
            return value.trim() ? undefined : error || 'Vui lòng nhập tên';
        }
    }
};
Validator.isEmail = (selector, error) => {
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : error || 'Vui lòng nhập Email';
        }
    }
}

Validator.minLength = (selector, min, error) => {
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : error || `Vui long nhap toi thieu ${min} ki tu`;
        }
    }
}

Validator.isConFirmpass = (selector, getConFirm, error) => {
    return {
        selector: selector,
        test: function(value){
            return value === getConFirm() ? undefined : error || 'Gia tri nhap vao khong chinh xac';
        }
    }
}