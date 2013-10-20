# Checkit.js

## A DOM-independent validation module for Node.js and the Browser

## Basic Usage

```js
var checkit = new Checkit({
  firstName: 'required',
  lastName: 'required',
  email: ['required', 'email']
});

var body = {
  email: 'test@example.com',
  firstName: 'Tim',
  lastName: 'Griesser',
  githubUsername: 'tgriesser'
};

checkit.run(body).then(function(validated) {
  console.log(validated);
})
```

-----

<table>
  <caption>
      Available Validators
  </caption>
  <thead>
    <tr>
      <th>Validation Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>accepted</td>
      <td>The field under validation must be yes, on, or 1. This is useful for validating "Terms of Service" acceptance.</td>
    </tr>
    <tr>
      <td>after:date</td>
      <td>The field under validation must be a value after a given date. The dates will be passed into the PHP strtotime function.</td>
    </tr>
    <tr>
      <td>alpha</td>
      <td>The field under validation must be entirely alphabetic characters.</td>
    </tr>
    <tr>
      <td>alphaDash</td>
      <td>The field under validation may have alpha-numeric characters, as well as dashes and underscores.</td>
    </tr>
    <tr>
      <td>alpha_num</td>
      <td>The field under validation must be entirely alpha-numeric characters.</td>
    </tr>
    <tr>
      <td>before:date</td>
      <td>The field under validation must be a value preceding the given date. The dates will be passed into the PHP strtotime function.</td>
    </tr>
    <tr>
      <td>between:min,max</td>
      <td>The field under validation must have a size between the given min and max. Strings, numerics, and files are evaluated in the same fashion as the size rule.</td>
    </tr>
    <tr>
      <td>confirmed</td>
      <td>The field under validation must have a matching field of foo_confirmation. For example, if the field under validation is password, a matching password_confirmation field must be present in the input.</td>
    </tr>
    <tr>
      <td>date</td>
      <td>The field under validation must be a valid date according to the strtotime PHP function.</td>
    </tr>
    <tr>
      <td>date_format:format</td>
      <td>The field under validation must match the format defined according to the date_parse_from_format PHP function.</td>
    </tr>
    <tr>
      <td>different:field</td>
      <td>The given field must be different than the field under validation.</td>
    </tr>
    <tr>
      <td>email</td>
      <td>The field under validation must be formatted as an e-mail address.</td>
    </tr>
    <tr>
      <td>in:foo,bar,...</td>
      <td>The field under validation must be included in the given list of values.</td>
    </tr>
    <tr>
      <td>integer</td>
      <td>The field under validation must have an integer value.</td>
    </tr>
    <tr>
      <td>ip</td>
      <td>The field under validation must be formatted as an IP address.</td>
    </tr>
    <tr>
      <td>max:value</td>
      <td>The field under validation must be less than a maximum value. Strings, numerics, and files are evaluated in the same fashion as the size rule.</td>
    </tr>
    <tr>
      <td>min:value</td>
      <td>The field under validation must have a minimum value. Strings, numerics, and files are evaluated in the same fashion as the size rule.</td>
    </tr>
    <tr>
      <td>not_in:foo,bar,...</td>
      <td>The field under validation must not be included in the given list of values.</td>
    </tr>
    <tr>
      <td>numeric</td>
      <td>The field under validation must have a numeric value.</td>
    </tr>
    <tr>
      <td>regex:pattern</td>
      <td>The field under validation must match the given regular expression.</td>
    </tr>
    <tr>
      <td>required</td>
      <td>The field under validation must be present in the input data.</td>
    </tr>
    <tr>
      <td>required_if:field,value</td>
      <td>The field under validation must be present if the field field is equal to value.</td>
    </tr>
    <tr>
      <td>required_with:foo,bar,...</td>
      <td>The field under validation must be present only if the other specified fields are present.</td>
    </tr>
    <tr>
      <td>required_without:foo,bar,...</td>
      <td>The field under validation must be present only when the other specified fields are not present.</td>
    </tr>
    <tr>
      <td>same:field</td>
      <td>The given field must match the field under validation.</td>
    </tr>
    <tr>
      <td>size:value</td>
      <td>The field under validation must have a size matching the given value.
          For string data, value corresponds to the number of characters. For numeric data, value corresponds to a given integer value.</td>
    </tr>
    <tr>
      <td>url</td>
      <td>The field under validation must be formatted as an URL.</td>
    </tr>
  </tbody>
</table>

### Conditionally adding rules

Sometimes you may wish to require a given field only if another field has a greater value than 100. Or you may need two fields to have a given value only when another field is present. Adding these validation rules doens't have to be a pain. First, create a `Checkit` instance with the main rules that never change:

```js
var checkit = new Checkit({
  firstName: ['required'],
  lastName: ['required'],
  email: ['required', 'email']
});
```

The first of the `maybe` method is the hash of validation fields / settings. The second argument is the function, evaluated with the object passed to the `Checkit` instance, and will add . This method makes it a breeze to build complex conditional validations.

```js
checkit.maybe({reason: 'required|max:500'}, function(input) {
    return input.games >= 100;
});
```

### Advanced &amp; Custom Validators




### Custom Error Messages

If needed, you may use custom error messages for validation instead of the defaults. There are several ways to specify custom messages.


