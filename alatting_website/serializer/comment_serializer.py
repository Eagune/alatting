__author__ = 'tianhuyang'
from django.contrib.humanize.templatetags.humanize import naturaltime
from rest_framework import serializers
from alatting_website.models import Comment, Person, User


class PersonSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user_id')

    class Meta:
        model = Person
        exclude = ('user', )


class UserSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'person')


class HumanDateTimeField(serializers.DateTimeField):

    def to_representation(self, value):
        return naturaltime(value)


class CommentSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    created_at = HumanDateTimeField(read_only=True)

    class Meta:
        model = Comment