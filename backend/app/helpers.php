<?php

if (!function_exists('onlyNumbers')) {
    function onlyNumbers(string $str): string {
        return preg_replace('/\D/', '', $str);
    }
}
