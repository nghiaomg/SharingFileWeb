package com.sharingfileweb.payload.response;

public class StandardResponse<T> {
    private boolean success;
    private String msg;
    private T data;

    public StandardResponse(boolean success, String msg, T data) {
        this.success = success;
        this.msg = msg;
        this.data = data;
    }

    public static <T> StandardResponse<T> success(String msg, T data) {
        return new StandardResponse<>(true, msg, data);
    }

    public static <T> StandardResponse<T> error(String msg, T data) {
        return new StandardResponse<>(false, msg, data);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
