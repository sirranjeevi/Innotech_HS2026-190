import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_portal/core/utils/validators.dart';

void main() {
  group('Validators Unit Tests', () {
    test('requiredField returns error if null or empty', () {
      expect(Validators.requiredField(null, 'Name'), 'Name is required');
      expect(Validators.requiredField('', 'Name'), 'Name is required');
      expect(Validators.requiredField('   ', 'Name'), 'Name is required');
      expect(Validators.requiredField('Valid Name', 'Name'), isNull);
    });

    test('validateUsername checks length and characters', () {
      expect(Validators.validateUsername(''), 'Username is required');
      expect(Validators.validateUsername('ab'), 'Username must be at least 3 characters');
      expect(Validators.validateUsername('a' * 21), 'Username cannot exceed 20 characters');
      expect(Validators.validateUsername('user!@#'), 'Username can only contain letters, numbers, and underscores');
      expect(Validators.validateUsername('valid_user123'), isNull);
    });

    test('validateEmail checks standard email patterns', () {
      expect(Validators.validateEmail(''), 'Email address is required');
      expect(Validators.validateEmail('invalid-email'), 'Enter a valid email address');
      expect(Validators.validateEmail('test@'), 'Enter a valid email address');
      expect(Validators.validateEmail('test@domain'), 'Enter a valid email address');
      expect(Validators.validateEmail('citizen@portal.gov'), isNull);
      expect(Validators.validateEmail('user.name+tag@gmail.com'), isNull);
    });

    test('validatePhone checks digit counts and characters', () {
      expect(Validators.validatePhone(''), 'Phone number is required');
      expect(Validators.validatePhone('12345'), 'Phone number must be between 10 and 15 digits');
      expect(Validators.validatePhone('+919876543210'), isNull);
      expect(Validators.validatePhone('9876543210'), isNull);
    });

    test('validatePassword requires minimum 6 characters', () {
      expect(Validators.validatePassword(''), 'Password is required');
      expect(Validators.validatePassword('12345'), 'Password must be at least 6 characters');
      expect(Validators.validatePassword('Secret123'), isNull);
    });

    test('validateConfirmPassword checks match with original', () {
      expect(Validators.validateConfirmPassword('', 'Secret123'), 'Please confirm your password');
      expect(Validators.validateConfirmPassword('Different123', 'Secret123'), 'Passwords do not match');
      expect(Validators.validateConfirmPassword('Secret123', 'Secret123'), isNull);
    });
  });
}
